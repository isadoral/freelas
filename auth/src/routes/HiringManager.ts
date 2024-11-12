import express, { Request, Response } from "express";

import { requireAuth } from "@izzietx/common";
import { BadRequestError, currentUser } from "@izzietx/common/build";
import { Company } from "../models/Company";
import { HiringManager } from "../models/HiringManager";

const router = express.Router();


router.post("/api/users/hiringmanager", currentUser, requireAuth, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const { hiringManager } = req.body;

    const company = await Company.findOne({ email: user });

    if (!company) {
        throw new BadRequestError("Only Companies can add hiring managers.");
    }

    let currentHMs: string[] = company.hiringManagers ? company.hiringManagers : hiringManager ;
    currentHMs.push(
        hiringManager
    )

    await Company.findOneAndUpdate({ email: user }, { hiringManagers: currentHMs });

    const updatedCompany = await Company.findOne({email: user})

    res.status(201).send(updatedCompany);
});

router.get("/api/users/hiringmanagers", currentUser, requireAuth, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const company = await Company.findOne({ email: user });

    if (!company) {
        throw new BadRequestError("Only Companies can see their hiring managers.");
    }

    const hiringManagers = company.hiringManagers;

    res.status(200).send(hiringManagers);
});

router.get("/api/users/hiringmanager", async (req: Request, res: Response) => {
    const { hiringManagerEmail } = req.body;

    const hiringManager = HiringManager.findOne({ email: hiringManagerEmail });

    if (!hiringManager) {
        throw new BadRequestError("Hiring Manager Not found");
    }

    res.status(200).send(hiringManager);
});

router.patch("/api/users/hiringmanager", currentUser, requireAuth, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const { hiringManager } = req.body;

    const company = await Company.findOne({ email: user });

    if (!company) {
        throw new BadRequestError("Only Companies can delete hiring managers.");
    }
    console.log(1);

    const currentHMs = company.hiringManagers;

    if (!currentHMs) {
        throw new BadRequestError("Hiring Manager not registered to company.");
    }

    console.log(currentHMs);

    const index = currentHMs.indexOf(hiringManager);
    delete currentHMs[index]

    console.log(index);
    console.log(currentHMs);


    const update = await Company.findOneAndUpdate({ email: user }, { hiringManagers: currentHMs });

    const deleteHM =  await HiringManager.findOneAndDelete({ email: hiringManager });

    res.status(201).send(update);
});

router.delete("/api/users/hiringmanager", currentUser, requireAuth, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const { tag } = req.body;

    const hiringManager = await HiringManager.findOne({ email: user });
    if (!hiringManager) {
        throw new BadRequestError("User not found.");
    }

    const hmCompany = hiringManager.company;
    const company = await Company.findOne({ email: user });

    if (!company) {
        throw new BadRequestError("Only Companies can delete hiring managers.");
    }

    const currentHMs = company.hiringManagers;

    if (!currentHMs) {
        throw new BadRequestError("Hiring Manager not registered to company.");
    }

    const index = currentHMs.indexOf(user);
    currentHMs.splice(index, 1);

    Company.findOneAndUpdate({ email: user }, { hiringManagers: currentHMs });

    HiringManager.findOneAndDelete({ email: hiringManager });

    res.status(200);
});


export { router as hiringManagerRouter };