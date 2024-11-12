import express, { Request, Response } from "express";

import { requireAuth } from "@izzietx/common";
import { BadRequestError, currentUser } from "@izzietx/common/build";
import { Company } from "../models/Company";

const router = express.Router();

router.get("/api/users/companies", async (req: Request, res: Response) => {
    const companies = await Company.find();

    res.status(200).send(companies);
});

router.get("/api/users/company", async (req: Request, res: Response) => {
    const { companyEmail } = req.body;

    const company = await Company.findOne({ email: companyEmail });

    res.status(200).send(company);
});

router.patch("/api/users/company", currentUser, requireAuth, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;
    const {
        countries,
        description,
        billingEmail,
        logo,
        extra,
        website
    } = req.body;

    const company = await Company.findOneAndUpdate({ email: user }, {
        billingEmail: billingEmail,
        countries: countries,
        description: description,
        extra: extra,
        logo: logo,
        website: website,
    });

    if (!company) {
        throw new BadRequestError("Only Companies can delete hiring managers.");
    }

    res.status(201);
});

router.delete("/api/users/company", currentUser, requireAuth, async (req: Request, res: Response) => {
    const user = req.currentUser!.email;

    await Company.findOneAndDelete({ email: user });

    res.status(200);
});


export { router as companyRouter };