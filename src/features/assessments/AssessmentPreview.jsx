import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getAssessment } from "../../api/client";
import "./AssessmentPreview.css";

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

    if (loading) return <p>Loading...</p>;
    if (!assessment) return <p>No assessment found for this job.</p>;

    return (
        <div className="assessment-preview" style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2>{assessment.title || "Assessment Preview"}</h2>

            {(assessment.sections || []).map((s) => (
                <div key={s.id} className="section-preview" style={{ marginBottom: 24 }}>
                    <h3>{s.title}</h3>

                    {(s.questions || []).map((q) => {
                        const visible = isVisible(q);
                        const value = responses[q.id] || "";

                        return (
                            <div
                                key={q.id}
                                className={`question-wrapper ${visible ? "visible" : "hidden"}`}
                            >
                                {visible && (
                                    <div className="question">
                                        <label>
                                            {q.label}
                                            {q.required && <span style={{ color: "red" }}> *</span>}
                                        </label>

                                        {q.description && (
                                            <small style={{ display: "block", color: "#666" }}>
                                                {q.description}
                                            </small>
                                        )}

                                        {q.type === "short" && (
                                            <input
                                                value={value}
                                                onChange={(e) =>
                                                    handleChange(q.id, e.target.value)
                                                }
                                            />
                                        )}

                                        {q.type === "long" && (
                                            <textarea
                                                value={value}
                                                onChange={(e) =>
                                                    handleChange(q.id, e.target.value)
                                                }
                                            />
                                        )}

                                        {q.type === "numeric" && (
                                            <div>
                                                <input
                                                    type="number"
                                                    value={value}
                                                    onChange={(e) =>
                                                        handleChange(q.id, e.target.value)
                                                    }
                                                />
                                                {q.min !== undefined && (
                                                    <small> Min: {q.min}</small>
                                                )}
                                                {q.max !== undefined && (
                                                    <small> Max: {q.max}</small>
                                                )}
                                            </div>
                                        )}

                                        {q.type === "single" && (
                                            <div>
                                                {(q.options || []).map((opt) => (
                                                    <label key={opt} style={{ marginLeft: 10 }}>
                                                        <input
                                                            type="radio"
                                                            name={q.id}
                                                            checked={value === opt}
                                                            onChange={() =>
                                                                handleChange(q.id, opt)
                                                            }
                                                        />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {q.type === "multi" && (
                                            <div>
                                                {(q.options || []).map((opt) => (
                                                    <label key={opt} style={{ marginLeft: 10 }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={
                                                                value.includes?.(opt) || false
                                                            }
                                                            onChange={(e) => {
                                                                const prev = value || [];
                                                                handleChange(
                                                                    q.id,
                                                                    e.target.checked
                                                                        ? [...prev, opt]
                                                                        : prev.filter(
                                                                              (o) => o !== opt
                                                                          )
                                                                );
                                                            }}
                                                        />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                        )}

                                        {q.type === "file" && (
                                            <input
                                                type="file"
                                                onChange={(e) =>
                                                    handleChange(
                                                        q.id,
                                                        e.target.files[0]?.name
                                                    )
                                                }
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}

            <button onClick={validate}>Validate</button>
        </div>
    );
}
