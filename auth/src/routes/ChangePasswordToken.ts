import express, { Request, Response } from "express";
import { Company } from "../models/Company";
import { HiringManager } from "../models/HiringManager";
import { Freela } from "../models/Freela";
import { BadRequestError, validateRequest } from "@izzietx/common/build";
import { Skill } from "../models/Skill";
import { body } from "express-validator";
import { sendTokenEmail } from "../services/SendEmail";
import { generateToken } from "../services/Token";

const router = express.Router();

router.patch("/api/users/changepasswordtoken",
    [
        body("email")
            .isEmail()
            .withMessage("Email must be valid"),
    ],
    validateRequest, async (req: Request, res: Response) => {
        const { userType, email } = req.body;
        const token = generateToken();

        if (userType === "company") {
            const existingCompany = await Company.findOne({ email: email });
            if (!existingCompany) {
                throw new BadRequestError("User not found");
            }
            Company.findOneAndUpdate({ email: email }, { token: token });

            sendTokenEmail(email, existingCompany.name, token, userType, "Change Password");
            res.status(200);

        } else if (userType === "hiringManager") {
            const existingHiringManager = await HiringManager.findOne({ email: email });
            if (!existingHiringManager) {
                throw new BadRequestError("User not found");
            }
            HiringManager.findOneAndUpdate({ email: email }, { token: token });

            const name = existingHiringManager.firstName + " " + existingHiringManager.lastName

            sendTokenEmail(email, name, token, userType, "Change Password");
            res.status(200);

        } else if (userType === "freela") {
            Freela.findOneAndUpdate({ token: token }, { emailConfirmed: true });
            const existingFreela = await Freela.findOne({ email: email });
            if (!existingFreela) {
                throw new BadRequestError("User not found");
            }
            Freela.findOneAndUpdate({ email: email }, { token: token });

            const name = existingFreela.firstName + " " + existingFreela.lastName

            sendTokenEmail(email, name, token, userType, "Change Password");
            res.status(200);
        } else {
            throw new BadRequestError("User not found");
        }
    });

export { router as changePasswordTokenRouter };