import express, { Request, Response } from "express";

import { currentUser, requireAuth } from "@izzietx/common";
import { Freela } from "../models/Freela";
import { BadRequestError } from "@izzietx/common/build";
import { Skill } from "../models/Skill";

const router = express.Router();


router.post("/api/users/skill", currentUser, requireAuth, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const { domain, topic, tag, link, description, price } = req.body;

    const freela = await Freela.findOne({ email: user });
    if (!freela) {
        throw new BadRequestError("Only Freelas can add skills.");
    }

    const skillExists = await Skill.findOne({ freela: user, tag: tag });
    if (skillExists) {
        throw new BadRequestError("Skill already exists");
    }

    const skill = Skill.build({
        description: description,
        domain: domain,
        freela: user,
        link: link,
        price: price,
        tag: tag,
        topic: topic
    });
    await skill.save();

    res.status(201).send(skill);
});

router.get("/api/users/skills", async (req: Request, res: Response) => {
    const { freela } = req.body;

    const skills = await Skill.find({ freela: freela });

    res.status(200).send(skills);
});

router.get("/api/users/skill", async (req: Request, res: Response) => {
    const { freela, tag } = req.body;

    const skill = await Skill.findOne({ freela: freela, tag: tag });

    res.status(200).send(skill);
});

router.get("/api/skills", async (req: Request, res: Response) => {

    const skills = await Skill.find();

    res.status(200).send(skills);
});

router.patch("/api/users/skill", currentUser, requireAuth, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const { tag, link, description, price } = req.body;

    const freela = await Freela.findOne({ email: user });
    if (!freela) {
        throw new BadRequestError("Only the Freela can edit a skill.");
    }

    const skill = await Skill.findOneAndUpdate({ freela: user, tag: tag }, {
        description: description,
        link: link,
        price: price,
    });

    res.status(201).send(skill);
});

router.delete("/api/users/skill", currentUser, requireAuth, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const { tag } = req.body;

    const freela = await Freela.findOne({ email: user });
    if (!freela) {
        throw new BadRequestError("Only the Freela can delete a skill.");
    }

    const skill = await Skill.findOneAndDelete({ freela: user, tag: tag });

    res.status(200);
});


export { router as skillsRouter };