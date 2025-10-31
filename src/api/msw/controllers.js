import { http, HttpResponse } from "msw";
import { db } from "../../db/dexie";

// Utility helpers
const json = (data, status = 200) => HttpResponse.json(data, { status });
const notFound = (msg) => HttpResponse.json({ error: msg }, { status: 404 });

export const controllers = [
    // --- Jobs
    http.get("/jobs", async ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get("search")?.toLowerCase() || "";
        const status = url.searchParams.get("status");
        const page = Number(url.searchParams.get("page") || 1);
        const pageSize = Number(url.searchParams.get("pageSize") || 10);

        let jobs = await db.jobs.toArray();
        if (search)
            jobs = jobs.filter((j) => j.title.toLowerCase().includes(search));
        if (status) jobs = jobs.filter((j) => j.status === status);
        // sorting for pagination interferes with frontend sort
        jobs.sort((a, b) => a.order - b.order);

        const start = (page - 1) * pageSize;
        const paged = jobs.slice(start, start + pageSize);

        return json({ total: jobs.length, data: paged });
    }),

    http.post("/jobs", async ({ request }) => {
        const body = await request.json();
        const id = crypto.randomUUID();
        const job = {
            id,
            title: body.title,
            slug: body.slug || body.title.toLowerCase().replace(/\s+/g, "-"),
            status: body.status || "active",
            tags: body.tags || [],
            order: (await db.jobs.count()) + 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        await db.jobs.add(job);
        return json(job, 201);
    }),

    http.get("/jobs/:id", async ({ params }) => {
        const job = await db.jobs.get(params.id);
        return job ? HttpResponse.json(job) : json({ error: "Job not found" }, { status: 404 });
    }),

    http.patch("/jobs/:id", async ({ params, request }) => {
        const body = await request.json();
        const job = await db.jobs.get(params.id);
        if (!job) return notFound("Job not found");
        const updated = { ...job, ...body, updatedAt: Date.now() };
        await db.jobs.put(updated);
        return json(updated);
    }),

    http.patch("/jobs/:id/reorder", async ({ params, request }) => {
        const { fromOrder, toOrder } = await request.json();
        console.log(params);
        const jobs = await db.jobs.orderBy("order").toArray();
        if (
            fromOrder === undefined ||
            toOrder === undefined ||
            fromOrder < 0 ||
            toOrder < 0 ||
            fromOrder >= jobs.length ||
            toOrder >= jobs.length
        ) {
            return json({ success: false, error: "Invalid indices" }, { status: 400 });
        }

        const moved = jobs.splice(fromOrder, 1)[0];
        console.log(moved);
        jobs.splice(toOrder, 0, moved);
        console.log(jobs);

        await db.transaction("rw", db.jobs, async () => {
            for (let i = 0; i < jobs.length; i++) {
                await db.jobs.update(jobs[i].id, { order: i });
            }
        });

        // if (Math.random() < 0.1) {
        //     throw new Response("Server error", { status: 500 });
        // }

        return json({ success: true });
    }),


    // --- Candidates
    http.get("/candidates", async ({ request }) => {
        const url = new URL(request.url);
        const search = url.searchParams.get("search")?.toLowerCase() || "";
        const stage = url.searchParams.get("stage");
        const page = Number(url.searchParams.get("page") || 1);
        const pageSize = Number(url.searchParams.get("pageSize") || 50);

        let candidates = await db.candidates.toArray();
        if (search)
            candidates = candidates.filter(
            (c) =>
                c.name.toLowerCase().includes(search) ||
                c.email.toLowerCase().includes(search)
            );
        if (stage) candidates = candidates.filter((c) => c.stage === stage);

        const start = (page - 1) * pageSize;
        const paged = candidates.slice(start, start + pageSize);
        return json({ total: candidates.length, data: paged });
    }),

    http.get("/candidates/:id", async ({ params }) => {
        const c = await db.candidates.get(params.id);
        if (!c) return notFound("Candidate not found");
        return json(c);
    }),

    http.patch("/candidates/:id", async ({ params, request }) => {
        const body = await request.json();
        const c = await db.candidates.get(params.id);
        if (!c) return notFound("Candidate not found");
        const updated = { ...c, ...body, updatedAt: Date.now() };
        await db.candidates.put(updated);
        if (body.stage && body.stage !== c.stage) {
            await db.timeline.add({
            id: crypto.randomUUID(),
            candidateId: c.id,
            type: "stage",
            from: c.stage,
            to: body.stage,
            createdAt: Date.now(),
            });
        }
        return json(updated);
    }),

    http.get("/candidates/:id/timeline", async ({ params }) => {
        const events = await db.timeline
            .where("candidateId")
            .equals(params.id)
            .toArray();
        return json(events.sort((a, b) => b.createdAt - a.createdAt));
    }),

    // --- Assessments
    http.get("/assessments/:jobId", async ({ params }) => {
        const a = await db.assessments.get(params.jobId);
        return a ? json(a) : notFound("Assessment not found");
    }),

    http.put("/assessments/:jobId", async ({ params, request }) => {
        const body = await request.json();
        const newA = { ...body, jobId: params.jobId, updatedAt: Date.now() };
        await db.assessments.put(newA);
        return json(newA);
    }),

    http.post("/assessments/:jobId/submit", async ({ params, request }) => {
        const body = await request.json();
        const r = {
            id: crypto.randomUUID(),
            jobId: params.jobId,
            candidateId: body.candidateId,
            answers: body.answers,
            submittedAt: Date.now(),
        };
        await db.responses.add(r);
        return json(r, 201);
    }),
];
