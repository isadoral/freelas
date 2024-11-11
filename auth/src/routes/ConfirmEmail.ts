import express, { Request, Response } from "express";
import { Company } from "../models/Company";
import { HiringManager } from "../models/HiringManager";
import { Freela } from "../models/Freela";
import { BadRequestError } from "@izzietx/common/build";

const router = express.Router();

router.patch("/api/users/confirmemail", async (req: Request, res: Response) => {
    const token = req.query.token;
    const userType = req.query.userType;

    if (userType === "company") {
        Company.findOneAndUpdate({ token: token }, { emailConfirmed: true });
        res.status(200)
    } else if (userType === "hiringManager") {
        HiringManager.findOneAndUpdate({ token: token }, { emailConfirmed: true });
        res.status(200)
    } else if (userType === "freela") {
        Freela.findOneAndUpdate({ token: token }, { emailConfirmed: true });
        res.status(200)
    } else {
        throw new BadRequestError("User token not found")
    }
});

export { router as confirmEmailRouter };