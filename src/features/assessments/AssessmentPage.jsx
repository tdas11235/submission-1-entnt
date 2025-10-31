import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAssessment, updateAssessment } from "../../api/client";
import AssessmentBuilder from "./AssessmentBuilder";

export default function AssessmentPage() {
    const { jobId } = useParams();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["assessment", jobId],
        queryFn: () => getAssessment(jobId),
    });

    const updateMutation = useMutation({
        mutationFn: (next) => updateAssessment(jobId, next),
        onSuccess: (data) => queryClient.setQueryData(["assessment", jobId], data),
    });

    if (isLoading) return <p>Loading...</p>;

    return (
        <div>
        <h2>Assessment Builder</h2>
        <AssessmentBuilder
            value={data}
            onChange={(next) => updateMutation.mutate(next)}
        />
        <Link to={`/assessments/${jobId}/preview`}>Preview</Link>
        </div>
    );
}
