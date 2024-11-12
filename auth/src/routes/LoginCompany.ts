import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest, BadRequestError} from "@izzietx/common";

import { Password } from "../services/Password";
import { Company } from "../models/Company";
import { generateUserJwt } from "../services/JWT";

const router = express.Router();

router.post("/api/users/logincompany",
    [
        body("email")
            .isEmail()
            .withMessage("Email must be valid"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("You must supply a password ")
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingCompany = await Company.findOne({ email });
        if (!existingCompany) {
            throw new BadRequestError("Invalid Credentials");
        }

        const passwordsMatch = await Password.compare(
            existingCompany.password,
            password
        );

        if (!passwordsMatch) {
            throw new BadRequestError("Invalid Credentials");
        }

        if (existingCompany.emailConfirmed === false) {
            res.status(403).send({message: "Email not verified"})
        }

        const userJwt = generateUserJwt(existingCompany.id, existingCompany.email, "company")

        // Store it on session object
        req.session = {
            jwt: userJwt
        };

        res.status(200).send(userJwt);

    });

export { router as loginCompanyRouter};