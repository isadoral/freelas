import express, { Request, Response } from "express";
import { Proposal } from "../models/Proposal";
import {
    BadRequestError,
    currentUser,
    requireAuth,
    requireAuthCompany,
    requireAuthFreela
} from "@izzietx/common/build";

const router = express.Router();

router.post("/api/jobs/company/sendProposal", currentUser, requireAuth, requireAuthCompany, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const userType = req.currentUser!.userType;
    const { job, freela, startDate, endDate, price } = req.body;

    let company = user;

    if (userType !== "company") {
        company = userType;
    }

    const proposalExists = Proposal.findOne({ company: company, freela: freela, price: price, job: job });

    const proposal = Proposal.build({
        job: job,
        company: company,
        freela: freela,
        status: "Sent",
        initiator: "company",
        timeline: {
            startDate: startDate,
            endDate: endDate
        },
        price: price
    });
    await proposal.save();

    res.status(201).send(proposal);
});

router.post("/api/jobs/freela/sendProposal", currentUser, requireAuth, requireAuthFreela, async (req: Request, res: Response) => {
    const freela = req.currentUser!.email;
    const { job, company, startDate, endDate, price } = req.body;

    const proposalExists = Proposal.findOne({ company: company, freela: freela, price: price, job: job });

    const proposal = Proposal.build({
        job: job,
        company: company,
        freela: freela,
        status: "Sent",
        initiator: "freela",
        timeline: {
            startDate: startDate,
            endDate: endDate
        },
        price: price
    });
    await proposal.save();

    res.status(201).send(proposal);
});

router.get("/api/jobs/company/proposals", currentUser, requireAuth, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;

    const proposals = await Proposal.findOne({company: user});

    res.status(200).send(proposals);
})

router.get("/api/jobs/freela/proposals", async (req: Request, res: Response) => {
    const user = req.currentUser!.email;

    const proposals = await Proposal.findOne({freela: user});

    res.status(200).send(proposals);
})

router.patch("/api/jobs/acceptProposal", currentUser, requireAuth, async (req: Request, res: Response) => {
    const { proposalId } = req.body;
    const userType = req.currentUser!.userType;
    const user = req.currentUser!.email;

    const proposal = await Proposal.findById({proposalId});
    if (!proposal) {
        throw new BadRequestError("Proposal not found")
    }

    if ((!proposal.initiator.includes(userType) && (proposal.company === user || proposal.freela === user)) ){
        await Proposal.findByIdAndUpdate({proposalId}, {status: "Accepted"})
    }
    res.status(201);

});

router.patch("/api/jobs/denyProposal", currentUser, requireAuth, async (req: Request, res: Response) => {
    const { proposalId } = req.body;
    const userType = req.currentUser!.userType;
    const user = req.currentUser!.email;

    const proposal = await Proposal.findById({proposalId});
    if (!proposal) {
        throw new BadRequestError("Proposal not found")
    }

    if ((!proposal.initiator.includes(userType) && (proposal.company === user || proposal.freela === user)) ){
        await Proposal.findByIdAndUpdate({proposalId}, {status: "Denied"})
    }

    res.status(201);
});

router.delete("/api/jobs/proposal", currentUser, requireAuth, async (req: Request, res: Response) => {
    const { proposalId } = req.body;
    const userType = req.currentUser!.userType;
    const user = req.currentUser!.email;

    await Proposal.findByIdAndDelete({proposalId});

    res.status(201);
})


export { router as proposalRouter };