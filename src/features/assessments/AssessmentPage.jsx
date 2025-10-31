import { useParams, Link as RouterLink } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAssessment, updateAssessment } from "../../api/client";
import AssessmentBuilder from "./AssessmentBuilder";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  CircularProgress,
  Button,
  Box,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function AssessmentPage() {
  const { jobId } = useParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["assessment", jobId],
    queryFn: () => getAssessment(jobId),
  });

  const updateMutation = useMutation({
    mutationFn: (next) => updateAssessment(jobId, next),
    onSuccess: (data) =>
      queryClient.setQueryData(["assessment", jobId], data),
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw",
        overflow: "hidden", }}>
      {/* Top Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Assessment Builder
          </Typography>
          <Button
            component={RouterLink}
            to={`/assessments/${jobId}/preview`}
            variant="contained"
            color="primary"
            startIcon={<VisibilityIcon />}
          >
            Preview
          </Button>
        </Toolbar>
      </AppBar>

      {/* Builder Content */}
      <Container
        maxWidth={false}
        disableGutters
        sx={{
            flexGrow: 1,
            py: 3,
            px: 2,
            overflowY: "auto",
        }}
        >
        <AssessmentBuilder
          value={data}
          onChange={(next) => updateMutation.mutate(next)}
        />
      </Container>
    </Box>
  );
}
