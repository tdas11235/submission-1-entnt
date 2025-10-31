import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCandidates } from "../../api/client";
import { Link } from "react-router-dom";

export default function CandidateList() {
    const [search, setSearch] = useState("");
    const [stage, setStage] = useState("");

    const { data = [], isLoading } = useQuery({
        queryKey: ["candidates", { search, stage }],
        queryFn: () => getCandidates({ search, stage }),
        select: (res) => res.data
    });

    if (isLoading) return <p>Loading candidates...</p>;

    return (
        <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            />
            <select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="">All stages</option>
            {["applied", "screen", "tech", "offer", "hired", "rejected"].map((s) => (
                <option key={s} value={s}>
                {s}
                </option>
            ))}
            </select>
        </div>

        <ul>
            {data.map((c) => (
            <li key={c.id}>
                <Link to={`/candidates/${c.id}`}>
                {c.name} - {c.email} ({c.stage})
                </Link>
            </li>
            ))}
        </ul>
        </div>
    );
}
