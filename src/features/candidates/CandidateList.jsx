import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCandidates, updateCandidate } from "../../api/client";
import { Link } from "react-router-dom";
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Fade,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardContent,
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"];

export default function CandidateList() {
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [view, setView] = useState("list");

  const queryClient = useQueryClient();

  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["candidates", { search, stage }],
    queryFn: () => getCandidates({ search, stage }),
    select: (res) => res.data,
  });

  const mutation = useMutation({
    mutationFn: ({ id, data }) => updateCandidate(id, data),
    onSuccess: () => queryClient.invalidateQueries(["candidates"]),
  });

  const [columns, setColumns] = useState({});

  useEffect(() => {
    const grouped = stages.reduce((acc, s) => {
      acc[s] = candidates.filter((c) => c.stage === s);
      return acc;
    }, {});
    setColumns(grouped);
  }, [candidates]);

  const handleViewChange = (_, newView) => {
    if (newView) setView(newView);
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index)
      return;

    const sourceStage = source.droppableId;
    const destStage = destination.droppableId;

    const sourceItems = Array.from(columns[sourceStage]);
    const destItems = Array.from(columns[destStage]);
    const [moved] = sourceItems.splice(source.index, 1);
    moved.stage = destStage;
    destItems.splice(destination.index, 0, moved);

    setColumns({
      ...columns,
      [sourceStage]: sourceItems,
      [destStage]: destItems,
    });

    mutation.mutate({ id: moved.id, data: { stage: destStage } });
  };

  if (isLoading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );

  return (
    <Box
      sx={{
        width: "100vw",
        overflowX: "hidden",
        py: 4,
        px: 3,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          maxWidth: "1200px",
          mx: "auto",
          width: "100%",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Candidates
        </Typography>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          size="small"
          sx={{
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <ToggleButton value="list">List</ToggleButton>
          <ToggleButton value="board">Board</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filters */}
      {view === "list" && (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
            maxWidth: "1200px",
            mx: "auto",
            width: "100%",
          }}
        >
          <TextField
            label="Search name or email"
            variant="outlined"
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <TextField
            label="Stage"
            select
            variant="outlined"
            size="small"
            value={stage}
            onChange={(e) => setStage(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All stages</MenuItem>
            {stages.map((s) => (
              <MenuItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}

      {/* List View */}
      {view === "list" && (
        <Paper elevation={2} sx={{ maxWidth: "1200px", mx: "auto", width: "100%" }}>
          <List>
            {candidates.length === 0 && (
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ textAlign: "center", py: 2 }}
              >
                No candidates found.
              </Typography>
            )}

            {candidates.map((c, idx) => (
              <Fade in timeout={400 + idx * 80} key={c.id}>
                <ListItem
                  component={Link}
                  to={`/candidates/${c.id}`}
                  sx={{
                    textDecoration: "none",
                    color: "inherit",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:hover": { backgroundColor: "action.hover" },
                  }}
                >
                  <ListItemText
                    primary={`${c.name} — ${c.email}`}
                    secondary={`Stage: ${c.stage}`}
                  />
                </ListItem>
              </Fade>
            ))}
          </List>
        </Paper>
      )}

      {/* Board View */}
      {view === "board" && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              pb: 2,
              px: 1,
              scrollSnapType: "x mandatory",
              "&::-webkit-scrollbar": { height: 8 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "grey.400",
                borderRadius: 4,
              },
            }}
          >
            {stages.map((s) => (
              <Droppable key={s} droppableId={s}>
                {(provided, snapshot) => (
                  <Paper
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{
                      flex: "0 0 280px",
                      p: 2,
                      bgcolor: snapshot.isDraggingOver
                        ? "grey.100"
                        : "background.paper",
                      borderRadius: 2,
                      boxShadow: 3,
                      scrollSnapAlign: "start",
                      minHeight: "70vh",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 2,
                        textTransform: "capitalize",
                        textAlign: "center",
                      }}
                    >
                      {s}
                    </Typography>

                    {columns[s]?.map((c, index) => (
                      <Draggable key={c.id} draggableId={c.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            component={Link}
                            to={`/candidates/${c.id}`}
                            sx={{
                              mb: 1.5,
                              textDecoration: "none",
                              color: "inherit",
                              opacity: snapshot.isDragging ? 0.8 : 1,
                              cursor: "grab",
                            }}
                          >
                            <CardContent>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {c.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {c.email}
                              </Typography>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </Paper>
                )}
              </Droppable>
            ))}
          </Box>
        </DragDropContext>
      )}
    </Box>
  );
}
