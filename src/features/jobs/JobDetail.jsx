import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getJobById } from "../../api/client";
import {
  Box,
  Typography,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from "@mui/material";

export default function JobDetail() {
  const { jobId } = useParams();

  const { data: job, isLoading, error } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => getJobById(jobId),
  });

  if (isLoading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" align="center" sx={{ mt: 8 }}>
        Error loading job.
      </Typography>
    );

  if (!job)
    return (
      <Typography align="center" sx={{ mt: 8 }}>
        Job not found.
      </Typography>
    );

  return (
    <Box
      sx={{
        width: "100vw",
        mx: "auto",
        mt: 5,
        p: 2,
      }}
    >
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {job.title}
          </Typography>

          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Status:</strong>{" "}
            <Chip
              label={job.status}
              color={job.status === "active" ? "success" : "default"}
              size="small"
            />
          </Typography>

          {job.tags?.length > 0 && (
            <Box sx={{ mt: 2, mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {job.tags.map((tag) => (
                <Chip key={tag} label={tag} variant="outlined" color="primary" />
              ))}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary">
            <strong>Created:</strong>{" "}
            {new Date(job.createdAt).toLocaleString()}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Updated:</strong>{" "}
            {new Date(job.updatedAt).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
