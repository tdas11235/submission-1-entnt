import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Fade,
} from "@mui/material";
import { getCandidateById, getCandidateTimeline } from "../../api/client";

export default function CandidateProfilePage() {
  const { id } = useParams();

  const { data: candidate, isLoading: loadingCandidate } = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => getCandidateById(id),
  });

  const { data: timeline = [], isLoading: loadingTimeline } = useQuery({
    queryKey: ["timeline", id],
    queryFn: () => getCandidateTimeline(id),
  });

  if (loadingCandidate)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );

  if (!candidate)
    return (
      <Typography align="center" color="text.secondary" mt={6}>
        Candidate not found.
      </Typography>
    );

  return (
    <Box
      sx={{
        width: "100vw",
        mx: "auto",
        py: 4,
        px: 2,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {/* Candidate Info */}
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {candidate.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Email: <strong>{candidate.email}</strong>
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            Stage:{" "}
            <Box
              component="span"
              sx={{
                px: 1,
                py: 0.3,
                borderRadius: 1,
                bgcolor: "primary.light",
                color: "primary.contrastText",
                fontSize: "0.9rem",
              }}
            >
              {candidate.stage}
            </Box>
          </Typography>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Status Changes
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {loadingTimeline ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={24} />
            </Box>
          ) : timeline.length === 0 ? (
            <Typography color="text.secondary">No timeline entries yet.</Typography>
          ) : (
            <Paper variant="outlined">
              <List>
                {timeline.map((t, idx) => (
                  <Fade in timeout={300 + idx * 80} key={t.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${t.fromStage} -> ${t.toStage}`}
                        secondary={new Date(t.createdAt).toLocaleString()}
                      />
                    </ListItem>
                  </Fade>
                ))}
              </List>
            </Paper>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
