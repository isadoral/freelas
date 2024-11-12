import express, { Request, Response } from "express";

import { currentUser, requireAuth, requireAuthCompany, BadRequestError } from "@izzietx/common";
import { Job } from "../models/Job";


const router = express.Router();

router.post("/api/jobs/job", currentUser, requireAuth, requireAuthCompany, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const userType = req.currentUser!.userType;
    const { projectName, domain, topic, tag, description, timeline, budget, extras } = req.body;

    let company = user;

    if (userType !== "company") {
        company = userType;
    }

    const skill = {
        domain: domain,
        topic: topic,
        tag: tag,
    };

    const jobExists = await Job.findOne({ company: company, projectName: projectName, skill: tag });
    if (jobExists) {
        throw new BadRequestError("Job already exists");
    }


    const job = Job.build({
        projectName: projectName,
        company: company,
        skill: {
            domain: domain,
            topic: topic,
            tag: tag,
        },
        description: description,
        status: "available",
        timeline: timeline,
        budget: budget,
        extras: extras,
    });
    await job.save();

    res.status(201).send(job);
});

router.get("/api/jobs/jobs", async (req: Request, res: Response) => {

    const jobs = await Job.find();

    res.status(200).send(jobs);
});

router.get("/api/jobs/companyjobs", async (req: Request, res: Response) => {
    const company = req.query.company;

    const jobs = await Job.find({ company: company });

    res.status(200).send(jobs);
});

router.get("/api/jobs/freelajobs", async (req: Request, res: Response) => {
    const freela = req.query.freela;

    const jobs = await Job.find({ freela: freela });

    res.status(200).send(jobs);
});

router.get("/api/jobs/job", async (req: Request, res: Response) => {
    const jobId = req.query.jobId;

    const job = await Job.findById({ jobId });

    res.status(200).send(job);
});

router.patch("/api/jobs/job", currentUser, requireAuth, requireAuthCompany, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const userType = req.currentUser!.userType;
    const jobId = req.query.jobId;
    const { budget, description, extras } = req.body;

    let company = user;

    if (userType !== "company") {
        company = userType;
    }

    const job = await Job.findOne({ id: jobId, company: company });
    if (!job) {
        throw new BadRequestError("Job not found.");
    }

    const jobUpdate = await Job.findOneAndUpdate({ id: jobId, company: company }, {
        description: description,
        budget: budget,
        extras: extras,
    });

    res.status(201).send(jobUpdate);
});

router.patch("/api/jobs/finalisejob", currentUser, requireAuth, requireAuthCompany, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const userType = req.currentUser!.userType;
    const jobId = req.query.jobId;
    const { finalPrice, startDate, endDate, freela } = req.body;

    let company = user;

    if (userType !== "company") {
        company = userType;
    }

    const job = await Job.findOne({ id: jobId, company: company });
    if (!job) {
        throw new BadRequestError("Job not found.");
    }

    const jobUpdate = await Job.findByIdAndUpdate({ jobId }, {
        freela: freela,
        finalPrice: finalPrice,
        timeline: {
            startDate: startDate,
            endDate: endDate,
        },
    });

    res.status(201).send(jobUpdate);
});

router.patch("/api/jobs/start", async (req: Request, res: Response) => {
    const jobId = req.query.jobId;

    const job = await Job.findById({ jobId });
    if (!job) {
        throw new BadRequestError("Job not found.");
    }

    if (!job.finalPrice) {
        throw new BadRequestError("Something went wrong");
    }

    const jobUpdate = await Job.findByIdAndUpdate({ jobId }, {
        status: "In Progress",
    });

    res.status(201);
});

router.patch("/api/jobs/end", async (req: Request, res: Response) => {
    const jobId = req.query.jobId;

    const job = await Job.findById({ jobId });
    if (!job) {
        throw new BadRequestError("Job not found.");
    }

    if (!job.finalPrice) {
        throw new BadRequestError("Something went wrong");
    }

    const jobUpdate = await Job.findByIdAndUpdate({ jobId }, {
        status: "Completed",
    });

    res.status(201);
});

router.delete("/api/jobs/job", currentUser, requireAuth, requireAuthCompany, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const jobId = req.query.jobId;

    const job = await Job.findByIdAndDelete({ jobId });


    res.status(200);
});

router.delete("/api/jobs/jobs", currentUser, requireAuth, requireAuthCompany, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const jobId = req.query.jobId;

    const job = await Job.deleteMany({ company: user });


    res.status(200);
});


export { router as jobRouter };