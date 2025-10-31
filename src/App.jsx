// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

// App.jsx
// import React from 'react';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import JobsBoard from './features/jobs/JobsBoard';

// // 1. Create a client
// // This client will hold the cache and configuration for your queries
// const queryClient = new QueryClient({
//     defaultOptions: {
//         queries: {
//             staleTime: 1000 * 5, // Data is considered fresh for 5 seconds
//         },
//     },
// });

// export default function App() {
//     return (
//         <QueryClientProvider client={queryClient}>
//             <div className="App">
//                 <h1>HR Job Board</h1>
//                 <JobsBoard />
//             </div>
//         </QueryClientProvider>
//     );
// }

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import JobsBoard from "./features/jobs/JobsBoard.jsx";

import CandidateList from "./features/candidates/CandidateList.jsx";
import CandidateProfilePage from "./features/candidates/CandidateProfilePage.jsx";

import AssessmentPage from "./features/assessments/AssessmentPage.jsx";
import AssessmentPreview from "./features/assessments/AssessmentPreview.jsx";
// import AssessmentFormPage from "../features/assessments/pages/AssessmentFormPage.jsx";

export default function App() {
    return (
        <BrowserRouter>
        <Routes>
            {/* Redirect root to Jobs */}
            <Route path="/" element={<Navigate to="/jobs" replace />} />

            {/* Jobs */}
            <Route path="/jobs" element={<JobsBoard />} />
            {/* <Route path="/jobs/:jobId" element={<JobDetailPage />} /> */}

            {/* Candidates */}
            <Route path="/candidates" element={<CandidateList />} />
            <Route path="/candidates/:id" element={<CandidateProfilePage />} />

            {/* Assessments */}
            <Route path="/assessments/:jobId" element={<AssessmentPage />} />
            <Route path="/assessments/:jobId/preview" element={<AssessmentPreview />} />
            {/* <Route path="/assessments/:jobId/fill/:candidateId" element={<AssessmentFormPage />} /> */}

            {/* 404 fallback */}
            <Route path="*" element={<p>404 — Not Found</p>} />
        </Routes>
        </BrowserRouter>
    );
}
