import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getJobs, createJob, patchJob, updateJobOrder } from "../../api/client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import JobEditorModal from "./JobEditorModal";

export default function JobsBoard() {
    const [search, setSearch] = useState("");
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const queryClient = useQueryClient();

    const { data: jobs = [], isLoading } = useQuery({
        queryKey: ["jobs", search],
        queryFn: () => getJobs({ search }),
        select: (res) => [...res.data].sort((a, b) => a.order - b.order),
    });

    const saveJobMutation = useMutation({
        mutationFn: ({id, ...payload}) => {id ? patchJob(id, payload) : createJob(payload)},
        onSuccess: () => queryClient.invalidateQueries(["jobs"])
    })


    const reorderMutation = useMutation({
        mutationFn: ({ jobId, fromIndex, toIndex }) =>
            updateJobOrder(jobId, fromIndex, toIndex),
        onMutate: async ({ fromIndex, toIndex }) => {
            await queryClient.cancelQueries(["jobs", search]);
            const previous = queryClient.getQueryData(["jobs", search]);
            const previousJobs = Array.isArray(previous) ? previous : (previous?.data || []);
            const lazy = [...previousJobs];
            const [moved] = lazy.splice(fromIndex, 1);
            lazy.splice(toIndex, 0, moved);
            const withOrder = lazy.map((j, i) => ({ ...j, order: i }));

            queryClient.setQueryData(["jobs", search], withOrder);
            return { previous: previousJobs };
        },
        onError: (_err, _vars, context) => {
            console.log(_err);
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
            console.log(fromIndex, toIndex);
            reorderMutation.mutate({
                jobId,
                fromIndex,
                toIndex,
            });
        },
        [reorderMutation, jobs]
    );

    return (
    <div className="jobs-board">
        <header>
        <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
        />
        <button onClick={() => setIsEditorOpen(true)}>+ New Job</button>
        </header>

        {isLoading && <p>Loading...</p>}

        <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="jobs">
            {(provided) => (
            <ol {...provided.droppableProps} ref={provided.innerRef}>
                {jobs.map((job, index) => (
                <Draggable key={job.id} draggableId={job.id} index={index}>
                    {(provided) => (
                    <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => {
                            setSelectedJob(job);
                            setIsEditorOpen(true);
                        }}
                        style={{
                            border: "1px solid #ddd",
                            padding: "0.5rem 0.75rem",
                            marginBottom: "0.5rem",
                            borderRadius: "6px",
                            background: "#000000",
                            cursor: "pointer",
                        }}
                        >
                        <div style={{ fontWeight: 600 }}>{job.title}</div>
                        <div style={{ fontSize: "0.9rem", color: "#555" }}>
                            Status: {job.status}
                        </div>

                        {job.tags?.length > 0 && (
                            <div style={{ marginTop: "0.25rem", display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {job.tags.map((tag) => (
                                <span
                                key={tag}
                                style={{
                                    background: "#eef",
                                    color: "#334",
                                    fontSize: "0.8rem",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                }}
                                >
                                {tag}
                                </span>
                            ))}
                            </div>
                        )}
                        </li>

                    )}
                </Draggable>
                ))}
                {provided.placeholder}
            </ol>
            )}
        </Droppable>
        </DragDropContext>

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
    </div>
    );
}