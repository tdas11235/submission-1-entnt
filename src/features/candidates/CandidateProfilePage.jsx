import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCandidateById, getCandidateTimeline } from "../../api/client";

export default function CandidateProfilePage() {
    const { id } = useParams();

    const { data: candidate } = useQuery({
        queryKey: ["candidate", id],
        queryFn: () => getCandidateById(id),
    });

    const { data: timeline = [] } = useQuery({
        queryKey: ["timeline", id],
        queryFn: () => getCandidateTimeline(id),
    });

    if (!candidate) return <p>Loading...</p>;

    return (
        <div>
        <h2>{candidate.name}</h2>
        <p>Email: {candidate.email}</p>
        <p>Stage: {candidate.stage}</p>

        <h3>Status Changes</h3>
        <ul>
            {timeline.map((t) => (
            <li key={t.id}>
                {new Date(t.createdAt).toLocaleString()} - {t.fromStage}  {" -> "}
                {t.toStage}
            </li>
            ))}
        </ul>
        </div>
    );
}
