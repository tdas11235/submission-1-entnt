import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Chip,
  Stack,
  Divider,
  Tooltip,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function AssessmentBuilder({ value, onChange }) {
  const [sections, setSections] = useState(value?.sections || []);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (value?.sections) setSections(value.sections);
  }, [value]);

  const handleChange = (nextSections) => {
    setSections(nextSections);
    onChange?.({ ...value, sections: nextSections });
  };

  const addSection = () => {
    const next = [
      ...sections,
      { id: crypto.randomUUID(), title: "New Section", questions: [] },
    ];
    handleChange(next);
  };

  const updateSectionTitle = (sid, title) => {
    const next = sections.map((s) => (s.id === sid ? { ...s, title } : s));
    handleChange(next);
  };

  const addQuestion = (sid) => {
    const next = sections.map((s) =>
      s.id === sid
        ? {
            ...s,
            questions: [
              ...s.questions,
              {
                id: crypto.randomUUID(),
                label: "Untitled",
                description: "",
                type: "short",
                required: false,
                options: [],
                conditional: [],
              },
            ],
          }
        : s
    );
    handleChange(next);
  };

  const updateQuestion = (sid, qid, updater) => {
    const next = sections.map((s) =>
      s.id === sid
        ? {
            ...s,
            questions: s.questions.map((q) =>
              q.id === qid ? { ...q, ...updater } : q
            ),
          }
        : s
    );
    handleChange(next);
  };

  const deleteQuestion = (sid, qid) => {
    const next = sections.map((s) =>
      s.id === sid
        ? { ...s, questions: s.questions.filter((q) => q.id !== qid) }
        : s
    );
    handleChange(next);
  };

  const copyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      alert("Failed to copy ID.");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, p: 2 }}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={addSection}
        sx={{ alignSelf: "flex-start" }}
      >
        Add Section
      </Button>

      {sections.map((s) => (
        <Card key={s.id} variant="outlined" sx={{ p: 2 }}>
          <CardHeader
            title={
              <TextField
                fullWidth
                variant="outlined"
                label="Section Title"
                value={s.title}
                onChange={(e) => updateSectionTitle(s.id, e.target.value)}
              />
            }
            action={
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => addQuestion(s.id)}
              >
                Add Question
              </Button>
            }
          />
          <CardContent>
            {s.questions.map((q) => (
              <Card
                key={q.id}
                variant="outlined"
                sx={{
                  mb: 2,
                  p: 2,
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Tooltip title="Copy Question ID">
                      <IconButton size="small" onClick={() => copyId(q.id)}>
                        <ContentCopyIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="caption">
                      {copiedId === q.id
                        ? "Copied!"
                        : `ID: ${q.id.slice(0, 6)}...`}
                    </Typography>
                    <TextField
                      fullWidth
                      label="Question Text"
                      value={q.label}
                      onChange={(e) =>
                        updateQuestion(s.id, q.id, { label: e.target.value })
                      }
                    />
                  </Stack>

                  <TextField
                    fullWidth
                    label="Description (optional)"
                    multiline
                    minRows={2}
                    value={q.description || ""}
                    onChange={(e) =>
                      updateQuestion(s.id, q.id, {
                        description: e.target.value,
                      })
                    }
                  />

                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={q.type}
                      label="Type"
                      onChange={(e) =>
                        updateQuestion(s.id, q.id, { type: e.target.value })
                      }
                    >
                      {[
                        "short",
                        "long",
                        "single",
                        "multi",
                        "numeric",
                        "file",
                      ].map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {["single", "multi"].includes(q.type) && (
                    <TextField
                      fullWidth
                      label="Options (comma separated)"
                      value={q.options?.join(", ") || ""}
                      onChange={(e) =>
                        updateQuestion(s.id, q.id, {
                          options: e.target.value
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  )}

                  {q.type === "numeric" && (
                    <Stack direction="row" spacing={2}>
                      <TextField
                        label="Min"
                        type="number"
                        value={q.min ?? ""}
                        onChange={(e) =>
                          updateQuestion(s.id, q.id, {
                            min: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                      <TextField
                        label="Max"
                        type="number"
                        value={q.max ?? ""}
                        onChange={(e) =>
                          updateQuestion(s.id, q.id, {
                            max: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                      />
                    </Stack>
                  )}

                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Show only if questions:
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        displayEmpty
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          if (!selectedId) return;
                          const existing = q.conditional || [];
                          if (!existing.includes(selectedId)) {
                            updateQuestion(s.id, q.id, {
                              conditional: [...existing, selectedId],
                            });
                          }
                        }}
                      >
                        <MenuItem value="">
                          <em>+ Add condition…</em>
                        </MenuItem>
                        {s.questions
                          .filter((other) => other.id !== q.id)
                          .map((other) => (
                            <MenuItem key={other.id} value={other.id}>
                              {other.label ||
                                `Untitled (${other.id.slice(0, 6)})`}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>

                    {q.conditional?.length > 0 && (
                      <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                        {q.conditional.map((cid) => {
                          const target = s.questions.find((x) => x.id === cid);
                          return (
                            <Chip
                              key={cid}
                              label={
                                target?.label ||
                                `(${cid.slice(0, 6)})`
                              }
                              onDelete={() =>
                                updateQuestion(s.id, q.id, {
                                  conditional: q.conditional.filter(
                                    (x) => x !== cid
                                  ),
                                })
                              }
                              color="default"
                              variant="outlined"
                            />
                          );
                        })}
                      </Stack>
                    )}
                  </Box>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={q.required}
                        onChange={(e) =>
                          updateQuestion(s.id, q.id, {
                            required: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Required"
                  />

                  <Divider />
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => deleteQuestion(s.id, q.id)}
                  >
                    Delete Question
                  </Button>
                </Stack>
              </Card>
            ))}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
