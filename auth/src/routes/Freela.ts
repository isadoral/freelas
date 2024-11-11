import express, { Request, Response } from "express";

import { requireAuth } from "@izzietx/common";
import { Freela } from "../models/Freela";

const router = express.Router();

router.get("/api/users/freelas", async (req: Request, res: Response) => {

    const freelas = Freela.find();

    res.status(200).send(freelas);
});

router.get("/api/users/freela", async (req: Request, res: Response) => {
    const { freelaEmail } = req.body;

    const freela = await Freela.findOne({ email: freelaEmail });

    res.status(200).send(freela);
});

router.patch("/api/users/freela", requireAuth, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const { firstName, lastName, country, github, linkedin, nationality, personalWebsite, statement } = req.body;

    const freela = await Freela.findOneAndUpdate({ email: user }, {
        country: country,
        firstName: firstName,
        github: github,
        lastName: lastName,
        linkedin: linkedin,
        nationality: nationality,
        personalWebsite: personalWebsite,
        statement: statement,
    });

    res.status(201).send(freela);
});

router.delete("/api/users/freela", requireAuth, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;

    await Freela.findOneAndDelete({ email: user });

    res.status(200);
});


export { router as freelaRouter };