import { useState, useEffect } from "react";

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
            {
                id: crypto.randomUUID(),
                title: "New Section",
                questions: [],
            },
        ];
        handleChange(next);
    };

    const updateSectionTitle = (sid, title) => {
        const next = sections.map((s) =>
            s.id === sid ? { ...s, title } : s
        );
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
                ? {
                      ...s,
                      questions: s.questions.filter((q) => q.id !== qid),
                  }
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
        <div className="assessment-builder">
            <button onClick={addSection}>+ Add Section</button>

            {sections.map((s) => (
                <div key={s.id} className="section-block">
                    <input
                        value={s.title}
                        onChange={(e) => updateSectionTitle(s.id, e.target.value)}
                        placeholder="Section title"
                    />

                    <button onClick={() => addQuestion(s.id)}>
                        + Add Question
                    </button>

                    <ul>
                        {s.questions.map((q) => (
                            <li key={q.id} className="question-block">
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <button
                                        onClick={() => copyId(q.id)}
                                        title="Copy Question ID"
                                        style={{
                                            fontSize: "0.75rem",
                                            padding: "2px 6px",
                                            border: "1px solid #ccc",
                                            borderRadius: "4px",
                                            background: copiedId === q.id ? "#d1fae5" : "#f3f4f6",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {copiedId === q.id ? "Copied!" : `ID: ${q.id.slice(0, 6)}...`}
                                    </button>

                                    <input
                                        value={q.label}
                                        onChange={(e) =>
                                            updateQuestion(s.id, q.id, {
                                                label: e.target.value,
                                            })
                                        }
                                        placeholder="Question text"
                                    />
                                </div>

                                <textarea
                                    value={q.description || ""}
                                    onChange={(e) =>
                                        updateQuestion(s.id, q.id, {
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Description (optional)"
                                />

                                <select
                                    value={q.type}
                                    onChange={(e) =>
                                        updateQuestion(s.id, q.id, {
                                            type: e.target.value,
                                        })
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
                                        <option key={t}>{t}</option>
                                    ))}
                                </select>

                                {["single", "multi"].includes(q.type) && (
                                    <textarea
                                        placeholder="Options (comma separated)"
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
                                    <div>
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={q.min ?? ""}
                                            onChange={(e) =>
                                                updateQuestion(s.id, q.id, {
                                                    min: e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined,
                                                })
                                            }
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={q.max ?? ""}
                                            onChange={(e) =>
                                                updateQuestion(s.id, q.id, {
                                                    max: e.target.value
                                                        ? Number(e.target.value)
                                                        : undefined,
                                                })
                                            }
                                        />
                                    </div>
                                )}

                                <div className="conditional-editor">
                                    <label>Show only if questions:</label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        <select
                                        onChange={(e) => {
                                            const selectedId = e.target.value;
                                            if (!selectedId) return;
                                            const existing = q.conditional || [];
                                            if (!existing.includes(selectedId)) {
                                            updateQuestion(s.id, q.id, {
                                                conditional: [...existing, selectedId],
                                            });
                                            }
                                            e.target.value = "";
                                        }}
                                        >
                                        <option value="">+ Add condition…</option>
                                        {s.questions
                                            .filter((other) => other.id !== q.id)
                                            .map((other) => (
                                            <option key={other.id} value={other.id}>
                                                {other.label || `Untitled (${other.id.slice(0, 6)})`}
                                            </option>
                                            ))}
                                        </select>

                                        {q.conditional?.length > 0 && (
                                        <div className="cond-list" style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                                            {q.conditional.map((cid) => {
                                            const target = s.questions.find((x) => x.id === cid);
                                            return (
                                                <button
                                                key={cid}
                                                onClick={() =>
                                                    updateQuestion(s.id, q.id, {
                                                    conditional: q.conditional.filter((x) => x !== cid),
                                                    })
                                                }
                                                title={target?.id}
                                                style={{
                                                    border: "1px solid #ccc",
                                                    padding: "2px 6px",
                                                    borderRadius: "4px",
                                                    cursor: "pointer",
                                                    background: "#f7f7f7",
                                                }}
                                                >
                                                ❌ {target?.label || `(${cid.slice(0, 6)})`}
                                                </button>
                                            );
                                            })}
                                        </div>
                                        )}
                                    </div>
                                    </div>


                                <label>
                                    <input
                                        type="checkbox"
                                        checked={q.required}
                                        onChange={(e) =>
                                            updateQuestion(s.id, q.id, {
                                                required: e.target.checked,
                                            })
                                        }
                                    />
                                    Required
                                </label>

                                <button onClick={() => deleteQuestion(s.id, q.id)}>
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
