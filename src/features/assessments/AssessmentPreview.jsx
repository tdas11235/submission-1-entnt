import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAssessment } from "../../api/client";
import {
  Box,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormGroup,
  Checkbox,
  Paper,
  Divider,
  Collapse,
  CircularProgress,
} from "@mui/material";

export default function AssessmentPreview() {
  const { jobId } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAssessment(jobId).then((res) => {
      setAssessment(res);
      setLoading(false);
    });
  }, [jobId]);

  const handleChange = (qid, value) => {
    setResponses((r) => ({ ...r, [qid]: value }));
  };

  const isVisible = (q) => {
    if (!q.conditional?.length) return true;
    return q.conditional.every((dep) => {
      const v = responses[dep];
      return Array.isArray(v) ? v.length > 0 : !!v;
    });
  };

  // auto-clear hidden question responses
  useEffect(() => {
    if (!assessment) return;
    const visibleIds = new Set();
    for (const s of assessment.sections || []) {
      for (const q of s.questions || []) {
        if (isVisible(q)) visibleIds.add(q.id);
      }
    }
    setResponses((r) => {
      const next = {};
      for (const [k, v] of Object.entries(r)) {
        if (visibleIds.has(k)) next[k] = v;
      }
      return next;
    });
  }, [responses, assessment]);

  const validate = () => {
    const errors = [];
    for (const s of assessment.sections || []) {
      for (const q of s.questions || []) {
        if (!isVisible(q)) continue;
        const v = responses[q.id];
        if (q.required && (v === undefined || v === "")) {
          errors.push(`${q.label} is required`);
        }
        if (q.type === "numeric") {
          const n = Number(v);
          if (isNaN(n)) errors.push(`${q.label} must be a number`);
          if (q.min !== undefined && n < q.min)
            errors.push(`${q.label} must be ≥ ${q.min}`);
          if (q.max !== undefined && n > q.max)
            errors.push(`${q.label} must be ≤ ${q.max}`);
        }
      }
    }
    if (errors.length) alert(errors.join("\n"));
    else alert("All responses valid!");
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );

  if (!assessment) return <Typography>No assessment found for this job.</Typography>;

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
      <Typography variant="h4" gutterBottom>
        {assessment.title || "Assessment Preview"}
      </Typography>

      {(assessment.sections || []).map((s) => (
        <Paper key={s.id} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {s.title}
          </Typography>
          <Divider sx={{ mb: 2 }} />

          {(s.questions || []).map((q) => {
            const visible = isVisible(q);
            const value = responses[q.id] || "";

            return (
              <Collapse key={q.id} in={visible} timeout={300} unmountOnExit>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {q.label}
                    {q.required && (
                      <Typography
                        component="span"
                        color="error"
                        sx={{ ml: 0.5, fontWeight: 700 }}
                      >
                        *
                      </Typography>
                    )}
                  </Typography>

                  {q.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {q.description}
                    </Typography>
                  )}

                  {/* Short Answer */}
                  {q.type === "short" && (
                    <TextField
                      fullWidth
                      size="small"
                      value={value}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                    />
                  )}

                  {/* Long Answer */}
                  {q.type === "long" && (
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      value={value}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                    />
                  )}

                  {/* Numeric */}
                  {q.type === "numeric" && (
                    <Box>
                      <TextField
                        type="number"
                        fullWidth
                        size="small"
                        value={value}
                        onChange={(e) => handleChange(q.id, e.target.value)}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {q.min !== undefined && `Min: ${q.min} `}
                        {q.max !== undefined && `Max: ${q.max}`}
                      </Typography>
                    </Box>
                  )}

                  {/* Single Choice */}
                  {q.type === "single" && (
                    <RadioGroup
                      value={value}
                      onChange={(e) => handleChange(q.id, e.target.value)}
                    >
                      {(q.options || []).map((opt) => (
                        <FormControlLabel
                          key={opt}
                          value={opt}
                          control={<Radio />}
                          label={opt}
                        />
                      ))}
                    </RadioGroup>
                  )}

                  {/* Multi Choice */}
                  {q.type === "multi" && (
                    <FormGroup>
                      {(q.options || []).map((opt) => (
                        <FormControlLabel
                          key={opt}
                          control={
                            <Checkbox
                              checked={value.includes?.(opt) || false}
                              onChange={(e) => {
                                const prev = value || [];
                                handleChange(
                                  q.id,
                                  e.target.checked
                                    ? [...prev, opt]
                                    : prev.filter((o) => o !== opt)
                                );
                              }}
                            />
                          }
                          label={opt}
                        />
                      ))}
                    </FormGroup>
                  )}

                  {/* File Upload */}
                  {q.type === "file" && (
                    <Button
                      variant="outlined"
                      component="label"
                      sx={{ mt: 1 }}
                    >
                      Upload File
                      <input
                        type="file"
                        hidden
                        onChange={(e) =>
                          handleChange(q.id, e.target.files[0]?.name)
                        }
                      />
                    </Button>
                  )}
                </Box>
              </Collapse>
            );
          })}
        </Paper>
      ))}

      <Button variant="contained" onClick={validate} sx={{ alignSelf: "center" }}>
        Validate
      </Button>
    </Box>
  );
}
