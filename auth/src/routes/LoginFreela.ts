import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest, BadRequestError } from "@izzietx/common";

import { Password } from "../services/Password";
import { Freela } from "../models/Freela";

const router = express.Router();

router.post("/api/users/loginfreela",
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

        const existingFreela = await Freela.findOne({ email });
        if (!existingFreela) {
            throw new BadRequestError("Invalid Credentials");
        }

        const passwordsMatch = await Password.compare(
            existingFreela.password,
            password
        );

        if (!passwordsMatch) {
            throw new BadRequestError("Invalid Credentials");
        }

        if (existingFreela.emailConfirmed === false) {
            res.status(403).send({message: "Email not verified"})
        }

        // Generate JWT
        const userJwt = jwt.sign({
                id: existingFreela.id,
                email: existingFreela.email
            },
            process.env.JWT_KEY!
        );

        // Store it on session object
        req.session = {
            jwt: userJwt
        };

        res.status(200).send(userJwt);

    });

export { router as loginFreelaRouter };