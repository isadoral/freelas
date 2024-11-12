import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest, BadRequestError } from "@izzietx/common";

import { Password } from "../services/Password";
import { HiringManager } from "../models/HiringManager";

const router = express.Router();

router.post("/api/users/loginHiringManager",
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

        const existingHiringManager = await HiringManager.findOne({ email });
        if (!existingHiringManager) {
            throw new BadRequestError("Email not found");
        }

        const passwordsMatch = await Password.compare(
            existingHiringManager.password,
            password
        );

        if (!passwordsMatch) {
            throw new BadRequestError("Invalid Credentials");
        }

        // if (existingHiringManager.emailConfirmed === false) {
        //     res.status(403).send({message: "Email not verified"})
        // }

        // Generate JWT
        const userJwt = jwt.sign({
                id: existingHiringManager.id,
                email: existingHiringManager.email
            },
            process.env.JWT_KEY!
        );

        // Store it on session object
        req.session = {
            jwt: userJwt
        };

        res.status(200).send(userJwt);

    });

export { router as loginHiringManagerRouter };