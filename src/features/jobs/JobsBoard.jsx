import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Typography,
  Chip,
  Paper,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Add, Edit, Psychology } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobs, createJob, patchJob, updateJobOrder } from "../../api/client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import JobEditorModal from "./JobEditorModal";

export default function JobsBoard() {
  const [search, setSearch] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", search],
    queryFn: () => getJobs({ search }),
    select: (res) => [...res.data].sort((a, b) => a.order - b.order),
  });

  const saveJobMutation = useMutation({
    mutationFn: ({ id, ...payload }) =>
      id ? patchJob(id, payload) : createJob(payload),
    onSuccess: () => queryClient.invalidateQueries(["jobs"]),
  });

  const reorderMutation = useMutation({
    mutationFn: ({ jobId, fromIndex, toIndex }) =>
      updateJobOrder(jobId, fromIndex, toIndex),
    onMutate: async ({ fromIndex, toIndex }) => {
      await queryClient.cancelQueries(["jobs", search]);
      const previous = queryClient.getQueryData(["jobs", search]);
      const previousJobs = Array.isArray(previous)
        ? previous
        : previous?.data || [];
      const lazy = [...previousJobs];
      const [moved] = lazy.splice(fromIndex, 1);
      lazy.splice(toIndex, 0, moved);
      const withOrder = lazy.map((j, i) => ({ ...j, order: i }));
      queryClient.setQueryData(["jobs", search], withOrder);
      return { previous: previousJobs };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["jobs", search], context.previous);
      }
    },
    onSettled: () => queryClient.invalidateQueries(["jobs", search]),
  });

  const handleDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;
      const fromIndex = result.source.index;
      const toIndex = result.destination.index;
      const jobId = jobs[fromIndex].id;
      reorderMutation.mutate({ jobId, fromIndex, toIndex });
    },
    [reorderMutation, jobs]
  );

  return (
    <Box sx={{ p: 3, width: "100vw", mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          mb: 3,
        }}
      >
        <TextField
          type="search"
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs..."
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setIsEditorOpen(true)}
          sx={{
            px: 4,
            py: 1.25,
            fontSize: "0.95rem",
            fontWeight: 600,
            borderRadius: 2,
            flexShrink: 0,
          }}
        >
          New Job
        </Button>
      </Box>

      {/* Loading / List */}
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : jobs.length === 0 ? (
        <Typography color="text.secondary" align="center">
          No jobs found.
        </Typography>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="jobs">
            {(provided) => (
              <Stack
                {...provided.droppableProps}
                ref={provided.innerRef}
                spacing={1.5}
              >
                {jobs.map((job, index) => (
                  <Draggable key={job.id} draggableId={job.id} index={index}>
                    {(provided) => (
                      <Paper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          cursor: "grab",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          "&:hover": { backgroundColor: "action.hover" },
                        }}
                      >
                        {/* Left section (click to go to job details) */}
                        <Box
                          sx={{ flexGrow: 1, cursor: "pointer" }}
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          <Typography variant="subtitle1" fontWeight={600}>
                            {job.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: job.tags?.length ? 1 : 0 }}
                          >
                            Status: {job.status}
                          </Typography>

                          {job.tags?.length > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {job.tags.map((tag) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  sx={{
                                    bgcolor: "primary.light",
                                    color: "primary.contrastText",
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>

                        {/* Right side buttons */}
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Assessment">
                            <IconButton
                              color="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/assessments/${job.id}`);
                              }}
                            >
                              <Psychology />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Edit Job">
                            <IconButton
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJob(job);
                                setIsEditorOpen(true);
                              }}
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Paper>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Stack>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Modal */}
      {isEditorOpen && (
        <JobEditorModal
          job={selectedJob}
          onClose={() => {
            setIsEditorOpen(false);
            setSelectedJob(null);
          }}
          onSave={(data) => saveJobMutation.mutate(data)}
        />
      )}
    </Box>
  );
}
