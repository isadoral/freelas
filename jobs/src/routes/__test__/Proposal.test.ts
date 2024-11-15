import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Proposal } from "../../models/Proposal";
import { Job } from "../../models/Job";

describe("Proposal Router", () => {
    const proposalData = {
        job: "12ed3d4dhgj55",
        freela: "test@test.com",
        timeline: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
        },
        price: 3000
    };
    const proposalData2 = {
        job: "12ed3d4dhgj55333",
        company: "test@company.com",
        timeline: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
        },
        price: 3000
    };
    const proposalData11 = {
        job: "12ed3d4dhgj5dd5",
        freela: "test@test.com",
        timeline: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
        },
        price: 3000
    };
    const proposalData22 = {
        job: "12ed3d4dhgj5ss5333",
        company: "test@company.com",
        timeline: {
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
        },
        price: 3000
    };

    beforeEach(async () => {
        await Proposal.deleteMany({});
    });

    it("returns 401 if user is not authenticated", async () => {
        await request(app)
            .post("/api/jobs/company/sendProposal")
            .send(proposalData)
            .expect(401);
    });

    it("returns 401 if user is not a company", async () => {
        const cookie = global.signinFreela();

        await request(app)
            .post("/api/jobs/company/sendProposal")
            .set("Cookie", cookie)
            .send(proposalData)
            .expect(401);
    });

    it("returns 401 if user is not a freela", async () => {
        const cookie = global.signinCompany();

        await request(app)
            .post("/api/jobs/freela/sendProposal")
            .set("Cookie", cookie)
            .send(proposalData)
            .expect(401);
    });

    it("returns 400 if proposal by company already exists", async () => {
        const cookie = global.signinCompany();

        await request(app)
            .post("/api/jobs/company/sendProposal")
            .set("Cookie", cookie)
            .send(proposalData)
            .expect(201);

        await request(app)
            .post("/api/jobs/company/sendProposal")
            .set("Cookie", cookie)
            .send(proposalData)
            .expect(400);
    });

    it("creates a proposal by company with valid inputs", async () => {
        const cookie = global.signinCompany();

        const response = await request(app)
            .post("/api/jobs/company/sendProposal")
            .set("Cookie", cookie)
            .send(proposalData)
            .expect(201);

        const proposal = await Proposal.findById(response.body.id);
        expect(proposal).not.toBeNull();
    });

    it("returns 400 if proposal by freela already exists", async () => {
        const cookie = global.signinFreela();

        await request(app)
            .post("/api/jobs/freela/sendProposal")
            .set("Cookie", cookie)
            .send(proposalData2)
            .expect(201);

        await request(app)
            .post("/api/jobs/freela/sendProposal")
            .set("Cookie", cookie)
            .send(proposalData2)
            .expect(400);
    });

    it("creates a proposal by freela with valid inputs", async () => {
        const cookie = global.signinFreela();

        const response = await request(app)
            .post("/api/jobs/freela/sendProposal")
            .set("Cookie", cookie)
            .send(proposalData2)
            .expect(201);

        const proposal = await Proposal.findById(response.body.id);
        expect(proposal).not.toBeNull();
    });

    it("returns all proposals company", async () => {
        const cookie = global.signinCompany();

        await request(app)
            .post("/api/jobs/company/sendProposal")
            .set("Cookie", cookie)
            .send(proposalData)
            .expect(201);

        await request(app)
            .post("/api/jobs/company/sendProposal")
            .set("Cookie", cookie)
            .send(proposalData11)
            .expect(201);

        const response = await request(app)
            .get("/api/jobs/company/proposals")
            .set("Cookie", cookie)
            .expect(200);

        expect(response.body.length).toBe(2);
    });

    it("returns all proposals freela", async () => {
        const cookie = global.signinFreela();

        await request(app)
            .post("/api/jobs/freela/sendProposal")
            .set("Cookie", cookie)
            .send(proposalData2)
            .expect(201);

        await request(app)
            .post("/api/jobs/freela/sendProposal")
            .set("Cookie", cookie)
            .send(proposalData22)
            .expect(201);

        const response = await request(app)
            .get("/api/jobs/freela/proposals")
            .set("Cookie", cookie)
            .expect(200);

        expect(response.body.length).toBe(2);
    });
});