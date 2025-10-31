import React, { useState, useEffect } from "react";

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
        const payload = { title, slug, status };
        if (job?.id) payload.id = job.id;
        onSave(payload);
        onClose();
    };

  return (
        <div className="modal">
        <form onSubmit={handleSubmit}>
            <label>Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
            <label>Slug</label>
            <input value={slug} readOnly />
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            </select>
            <label>
            Tags (comma separated)
            <input
                type="text"
                value={tags?.join(", ") || ""}
                onChange={(e) =>
                    setTags(e.target.value.split(",").map((t) => t.trim()).filter(Boolean))
                }
            />
            </label>
            <footer>
            <button type="submit">Save</button>
            <button onClick={onClose}>Cancel</button>
            </footer>
        </form>
        </div>
    );
}
