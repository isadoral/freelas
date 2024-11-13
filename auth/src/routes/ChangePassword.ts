import express, { Request, Response } from "express";
import { Company } from "../models/Company";
import { HiringManager } from "../models/HiringManager";
import { Freela } from "../models/Freela";
import { BadRequestError } from "@izzietx/common/build";

const router = express.Router();

router.patch("/api/users/changepassword", async (req: Request, res: Response) => {
    const token = req.query.token;
    const userType = req.query.userType;
    const { password } = req.body()

    if (userType === "company") {
        await Company.findOneAndUpdate({ token: token }, { password: password });
        res.status(200)
    } else if (userType === "hiringManager") {
        await HiringManager.findOneAndUpdate({ token: token }, { password: password });
        res.status(200)
    } else if (userType === "freela") {
        await Freela.findOneAndUpdate({ token: token }, { password: password });
        res.status(200)
    } else {
        throw new BadRequestError("User token not found")
    }
});

export { router as changePasswordRouter };