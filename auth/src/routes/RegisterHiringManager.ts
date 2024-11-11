import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken"
import { validateRequest, BadRequestError } from "@izzietx/common"

import { HiringManager } from "../models/HiringManager";
import { Company } from "../models/Company";
import { sendTokenEmail } from "../services/SendEmail";
import { generateToken } from "../services/Token";

const router = express.Router();

router.post("/api/users/hiringmanager",
    [

        body("email")
            .isEmail()
            .withMessage("Email must be valid"),
        body("password")
            .trim()
            .isLength({ min: 4, max: 20 })
            .withMessage("Password must be between 4 and 20 characters"),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password, firstName, lastName, company } = req.body;

        const existingHiringManager = await HiringManager.findOne({ email });

        if (existingHiringManager) {
            throw new BadRequestError("Email already in use");
        }

        const validCompany = await Company.findOne({name: company})
        if (!validCompany) {
            throw new BadRequestError("Company not registerd");
        }
        if (validCompany.hiringManagers) {
            if (!validCompany.hiringManagers.includes(email)) {
                throw new BadRequestError("Hiring Manager not registered to company");
            }
        }

        const token = generateToken()
        const userType = "hiringManager"

        const user = HiringManager.build({
            company: company,
            email: email,
            emailConfirmed: false,
            firstName: firstName,
            lastName: lastName,
            password: password,
            userType: userType,
            token: token
        })
        await user.save();

        const name = firstName + " " + lastName

        sendTokenEmail(email, name, token, userType, "Confirm Email")

        // Generate JWT
        const userJwt = jwt.sign({
                id: user.id,
                email: user.email
            },
            process.env.JWT_KEY!
        );

        // Store it on session object
        req.session = {
            jwt: userJwt
        };

        res.status(201).send(user);
    });

export { router as registerHiringManagerRouter };