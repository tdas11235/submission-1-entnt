import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  FormControl,
  InputLabel,
} from "@mui/material";

export default function JobEditorModal({ job, onSave, onClose }) {
  const [title, setTitle] = useState(job?.title || "");
  const [slug, setSlug] = useState(job?.slug || "");
  const [status, setStatus] = useState(job?.status || "active");
  const [tags, setTags] = useState(job?.tags || []);

  useEffect(() => {
    setSlug(title.toLowerCase().replace(/\s+/g, "-"));
  }, [title]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return alert("Title required");
    const payload = { title, slug, status, tags };
    if (job?.id) payload.id = job.id;
    onSave(payload);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {job ? "Edit Job" : "Create New Job"}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Slug"
              value={slug}
              slotProps={{
                    input: { readOnly: true },
                }}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Tags (comma separated)"
              value={tags?.join(", ") || ""}
              onChange={(e) =>
                setTags(
                  e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean)
                )
              }
              fullWidth
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
