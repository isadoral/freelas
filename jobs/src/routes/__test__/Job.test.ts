import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Job } from "../../models/Job";
describe("Jobs Router", () => {
    const jobData = {
        projectName: "Test Project",
        domain: "Web Development",
        topic: "Frontend",
        tag: "React",
        description: "Test description",
        timeline: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
        },
        budget: 1000,
        extras: "No extras",
    };
    const jobData2 = {
        projectName: "Test Project Two",
        domain: "Web Development",
        topic: "Backend",
        tag: "Express",
        description: "Test description",
        timeline: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
        },
        budget: 1000,
        extras: "No extras",
    };

    beforeEach(async () => {
        await Job.deleteMany({});
    });

    it("returns 401 if user is not authenticated", async () => {
        await request(app)
            .post("/api/jobs/job")
            .send(jobData)
            .expect(401);
    });

    it("returns 401 if user is not a company", async () => {
        const cookie = global.signinFreela();

        await request(app)
            .post("/api/jobs/job")
            .set("Cookie", cookie)
            .send(jobData)
            .expect(401);
    });

    it("returns 400 if job with same project name and tag already exists", async () => {
        const cookie = global.signinCompany();

        await request(app)
            .post("/api/jobs/job")
            .set("Cookie", cookie)
            .send(jobData)
            .expect(201);

        await request(app)
            .post("/api/jobs/job")
            .set("Cookie", cookie)
            .send(jobData)
            .expect(400);
    });

    it("creates a job with valid inputs", async () => {
        const cookie = global.signinCompany();

        const response = await request(app)
            .post("/api/jobs/job")
            .set("Cookie", cookie)
            .send(jobData)
            .expect(201);

        const job = await Job.findById(response.body.id);
        expect(job).not.toBeNull();
    });

    it("returns all jobs", async () => {
        const cookie = global.signinCompany();

        await request(app)
            .post("/api/jobs/job")
            .set("Cookie", cookie)
            .send(jobData)
            .expect(201);

        await request(app)
            .post("/api/jobs/job")
            .set("Cookie", cookie)
            .send(jobData2)
            .expect(201);

        const response = await request(app)
            .get("/api/jobs/jobs")
            .expect(200);

        expect(response.body.length).toBe(2);
    });

    it("returns jobs for specific company", async () => {
        const cookie = global.signinCompany();
        const company = "test@company.com";

        await request(app)
            .post("/api/jobs/job")
            .set("Cookie", cookie)
            .send(jobData)
            .expect(201);

        const response = await request(app)
            .get("/api/jobs/companyjobs")
            .query({ company })
            .expect(200);

        expect(response.body.length).toBe(1);
        expect(response.body[0].company).toBe(company);
    });

    it("returns 401 if user is not authenticated", async () => {
        const jobId = new mongoose.Types.ObjectId().toHexString();

        await request(app)
            .patch("/api/jobs/job")
            .query({ jobId })
            .send({})
            .expect(401);
    });

    it("updates job with valid inputs", async () => {
        const cookie = global.signinCompany();

        const job = await request(app)
            .post("/api/jobs/job")
            .set("Cookie", cookie)
            .send(jobData)
            .expect(201);
        const jobId = (
            job.body.id
        );

        const response = await request(app)
            .patch("/api/jobs/job")
            .set("Cookie", cookie)
            .query({ jobId: jobId })
            .send({
                description: "Updated description",
                budget: [ 2000, 3000 ],
                extras: "Updated extras",
            })
            .expect(201);

        expect(response.body.description).toBe("Updated description");
        expect(response.body.budget).toEqual([ 2000, 3000 ]);
    });


    it("finalizes job with valid inputs", async () => {
        const cookie = global.signinCompany();

        const job = await request(app)
            .post("/api/jobs/job")
            .set("Cookie", cookie)
            .send(jobData)
            .expect(201);
        const jobId = (
            job.body.id
        );

        const date = new Date(Date.now());
        const response = await request(app)
            .patch("/api/jobs/finalisejob")
            .set("Cookie", cookie)
            .query({ jobId: jobId })
            .send({
                finalPrice: 1500,
                startDate: date,
                endDate: new Date(Date.now() + 86400000),
                freela: "test@freelancer.com",
            })
            .expect(201);

        const stringDate = date.toISOString();

        expect(response.body.finalPrice).toEqual(1500);
        expect(response.body.freela).toBe("test@freelancer.com");
        expect(response.body.timeline.startDate).toEqual(stringDate);
    });

    it("finalizes job and starts", async () => {
        const cookie = global.signinCompany();

        const job = await request(app)
            .post("/api/jobs/job")
            .set("Cookie", cookie)
            .send(jobData)
            .expect(201);
        const jobId = (
            job.body.id
        );

        const date = new Date(Date.now());
        const response = await request(app)
            .patch("/api/jobs/finalisejob")
            .set("Cookie", cookie)
            .query({ jobId: jobId })
            .send({
                finalPrice: 1500,
                startDate: date,
                endDate: new Date(Date.now() + 86400000),
                freela: "test@freelancer.com",
            })
            .expect(201);

        await request(app)
                .patch("/api/jobs/start")
                .set("Cookie", cookie)
                .query({ jobId: jobId })
                .expect(201);

    }, 70000);

    it("finalizes job and ends job", async () => {
        const cookie = global.signinCompany();

        const job = await request(app)
            .post("/api/jobs/job")
            .set("Cookie", cookie)
            .send(jobData)
            .expect(201);
        const jobId = (
            job.body.id
        );

        const date = new Date(Date.now());
        const response = await request(app)
            .patch("/api/jobs/finalisejob")
            .set("Cookie", cookie)
            .query({ jobId: jobId })
            .send({
                finalPrice: 1500,
                startDate: date,
                endDate: new Date(Date.now() + 86400000),
                freela: "test@freelancer.com",
            })
            .expect(201);

        await request(app)
            .patch("/api/jobs/end")
            .set("Cookie", cookie)
            .query({ jobId: jobId })
            .expect(201);

    }, 70000);

});