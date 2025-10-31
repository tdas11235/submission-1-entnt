import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getJobById } from "../../api/client";

export default function JobDetail() {
  const { jobId } = useParams();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJobById(jobId),
  });

  if (isLoading) return <p>Loading job...</p>;
  if (error) return <p>Error loading job.</p>;
  if (!job) return <p>Job not found.</p>;

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2>{job.title}</h2>
      <p>Status: {job.status}</p>
      {job.tags?.length > 0 && (
        <p>Tags: {job.tags.join(", ")}</p>
      )}
      <p>Created: {new Date(job.createdAt).toLocaleString()}</p>
      <p>Updated: {new Date(job.updatedAt).toLocaleString()}</p>
    </div>
  );
}
