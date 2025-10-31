export async function apiFetch(path, options = {}) {
    console.log(path);
    const res = await fetch(path, {
        headers: { "Content-Type": "application/json" },
        ...options,
    });
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
}


export const getJobs = (params = {}) =>
    apiFetch(`/jobs?${new URLSearchParams(params)}`);

export const getJobById = (id) => {
    return apiFetch(`/jobs/${id}`)
}

export const createJob = (data) =>
    apiFetch("/jobs", { 
        method: "POST", 
        body: JSON.stringify(data) 
    });

export const patchJob = (id, data) =>
    apiFetch(`/jobs/${id}`, { 
        method: "PATCH", 
        body: JSON.stringify(data) 
    });

export const updateJobOrder = (jobId, fromIndex, toIndex) => {
    console.log("updateJobOrder called:", { jobId, fromIndex, toIndex });
    return apiFetch(`/jobs/${jobId}/reorder`, {
        method: "PATCH",
        body: JSON.stringify({ 
            fromOrder: fromIndex, 
            toOrder: toIndex 
        }),
    });
}

export const getCandidates = (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return apiFetch(`/candidates?${searchParams}`);
}

export const getCandidateById = (id) => {
    return apiFetch(`/candidates/${id}`)
}

export const updateCandidate = (id, data) => {
    return apiFetch(`/candidates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data)
    })
}

export const getCandidateTimeline = (id) => apiFetch(`/candidates/${id}/timeline`);

export const getAssessment = (jobId) => apiFetch(`/assessments/${jobId}`);

export const updateAssessment = (jobId, data) => {
    return apiFetch(`/assessments/${jobId}`, {
        method: "PUT",
        body: JSON.stringify(data)
    });
}

export const submitAssessment = (jobId, payload) => {
    return apiFetch(`/assessments/${jobId}/submit`, {
        method: "POST",
        body: JSON.stringify(payload)
    });
}