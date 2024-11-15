import express, { Request, Response } from "express";
import { Proposal } from "../models/Proposal";
import {
    BadRequestError,
    currentUser, NotAuthorisedError,
    requireAuth,
    requireAuthCompany,
    requireAuthFreela
} from "@izzietx/common/build";

const router = express.Router();

router.post("/api/jobs/company/sendProposal", currentUser, requireAuth, requireAuthCompany, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const userType = req.currentUser!.userType;
    const { job, freela, timeline, price } = req.body;

    let company = user;

    if (userType !== "company") {
        company = userType;
    }

    const proposalExists = await Proposal.findOne({ company: company, freela: freela, price: price, job: job });
    if (proposalExists) {
        throw new BadRequestError("Proposal already exists");
    }

    const proposal = Proposal.build({
        job: job,
        company: company,
        freela: freela,
        status: "Sent",
        initiator: "company",
        timeline: timeline,
        price: price
    });
    await proposal.save();

    res.status(201).send(proposal);
});

router.post("/api/jobs/freela/sendProposal", currentUser, requireAuth, requireAuthFreela, async (req: Request, res: Response) => {
    const freela = req.currentUser!.email;
    const { job, company, timeline, price } = req.body;

    const proposalExists = await Proposal.findOne({ company: company, freela: freela, price: price, job: job });
    if (proposalExists) {
        throw new BadRequestError("Proposal already exists");
    }

    const proposal = Proposal.build({
        job: job,
        company: company,
        freela: freela,
        status: "Sent",
        initiator: "freela",
        timeline: timeline,
        price: price
    });
    await proposal.save();

    res.status(201).send(proposal);
});

router.get("/api/jobs/company/proposals", currentUser, requireAuth, requireAuthCompany, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;

    const proposals = await Proposal.find({ company: user });

    res.status(200).send(proposals);
});

router.get("/api/jobs/freela/proposals", currentUser, requireAuth, requireAuthFreela, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;

    const proposals = await Proposal.find({ freela: user });

    res.status(200).send(proposals);
});

router.patch("/api/jobs/freela/acceptProposal", currentUser, requireAuth, async (req: Request, res: Response) => {
    const proposalId = req.query.proposalId;
    const userType = req.currentUser!.userType;
    const user = req.currentUser!.email;

    let currentUserType = "company";
    let company = "";

    if (userType === "freela") {
        currentUserType = "freela";
    } else if (userType !== "company") {
        company = userType;
    }

    const proposal = await Proposal.findById({ _id: proposalId });
    if (!proposal) {
        throw new BadRequestError("Proposal not found");
    }

    if (!(
        proposal.initiator === currentUserType
    )) {
        if (proposal.company === company || proposal.freela === user) {
            await Proposal.findByIdAndUpdate({ _id: proposalId }, { status: "Accepted" });
        } else {
            throw new NotAuthorisedError();
        }
    } else {
        throw new NotAuthorisedError();
    }

    res.status(201);
});

router.patch("/api/jobs/denyProposal", currentUser, requireAuth, async (req: Request, res: Response) => {
    const proposalId = req.query.proposalId;
    const userType = req.currentUser!.userType;
    const user = req.currentUser!.email;

    let currentUserType = "company";
    let company = "";

    if (userType === "freela") {
        currentUserType = "freela";
    } else if (userType !== "company") {
        company = userType;
    }

    const proposal = await Proposal.findById({ _id: proposalId });
    if (!proposal) {
        throw new BadRequestError("Proposal not found");
    }

    if (proposal.initiator === currentUserType && (
        proposal.company !== company || proposal.freela !== user
    )) {
        throw new NotAuthorisedError();
    }
    await Proposal.findByIdAndUpdate({ _id: proposalId }, { status: "Denied" });
    res.status(201);
});

router.delete("/api/jobs/proposal", currentUser, requireAuth, async (req: Request, res: Response) => {
    const { proposalId } = req.body;
    const userType = req.currentUser!.userType;
    const user = req.currentUser!.email;

    await Proposal.findByIdAndDelete({ proposalId });

    res.status(201);
});


export { router as proposalRouter };