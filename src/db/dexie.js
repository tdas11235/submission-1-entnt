import Dexie from "dexie";
import { v4 as uuid } from "uuid";

export const db = new Dexie("hire_db");
db.version(1).stores({
    jobs: "&id,slug,status,order",
    candidates: "&id,email,name,jobId,stage",
    timeline: "&id,candidateId,createdAt",
    assessments: "&jobId,updatedAt",
    responses: "&id,jobId,candidateId,submittedAt",
});

export async function clearDatabase() {
  try {
    await db.delete();
    console.log("Dexie Database successfully deleted.");
  } catch (error) {
    console.error("Failed to delete database:", error);
  }
}

export async function seedIfNeeded() {
    const jobCount = await db.jobs.count();
    if (jobCount > 0) return;

    const tags = ["frontend", "backend", "design", "sales", "hr"];
    const now = Date.now();

    // Jobs
    const jobs = Array.from({ length: 25 }, (_, i) => ({
        id: uuid(),
        title: `Job ${i + 1} - ${["Engineer", "Designer", "PM"][i % 3]}`,
        slug: `job-${i + 1}`,
        status: Math.random() > 0.2 ? "active" : "archived",
        tags: [tags[i % tags.length]],
        order: i + 1,
        createdAt: now,
        updatedAt: now,
    }));
    await db.jobs.bulkAdd(jobs);

    // --- Candidates
    const stages = ["applied", "screen", "tech", "offer", "hired", "rejected"];
    const candidates = Array.from({ length: 1000 }, (_, i) => ({
        id: uuid(),
        name: `Candidate ${i + 1}`,
        email: `candidate${i + 1}@example.com`,
        jobId: jobs[i % jobs.length].id,
        stage: stages[i % stages.length],
        createdAt: now,
        updatedAt: now,
    }));
    await db.candidates.bulkAdd(candidates);

    // --- Assessments (3 jobs only)
    const assessments = jobs.slice(0, 3).map((job) => ({
      jobId: job.id,
      sections: [
        {
          id: uuid(),
          title: "General",
          questions: Array.from({ length: 10 }, (_, qi) => {
            const type = ["short", "long", "single", "multi", "numeric"][
              qi % 5
            ];
            return {
              id: uuid(),
              label: `Question ${qi + 1}`,
              description: `This is a description for question ${qi + 1}.`,
              type,
              required: qi % 2 === 0,
              options:
                type === "single" || type === "multi"
                  ? ["Option A", "Option B", "Option C", "Option D"]
                  : [],
              min: type === "numeric" ? 0 : undefined,
              max: type === "numeric" ? 10 : undefined,
              maxLength: type === "short" || type === "long" ? 200 : undefined,
              condition: null,
            };
          }),
        },
      ],
      updatedAt: now,
    }));
    await db.assessments.bulkAdd(assessments);

    console.log("Seeding DB finished.");
}