import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest, BadRequestError} from "@izzietx/common";

import { Password } from "../services/password";
import { Company } from "../models/Company";

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

        // Generate JWT
        const userJwt = jwt.sign({
                id: existingCompany.id,
                email: existingCompany.email
            },
            process.env.JWT_KEY!
        );

        // Store it on session object
        req.session = {
            jwt: userJwt
        };

        res.status(200).send(userJwt);

    });

export { router as loginCompanyRouter};