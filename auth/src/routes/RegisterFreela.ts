import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken"
import { validateRequest, BadRequestError } from "@izzietx/common"

import {Freela } from "../models/Freela";
import { generateToken } from "../services/Token";
import { sendTokenEmail } from "../services/SendEmail";
import { generateUserJwt } from "../services/JWT";

const router = express.Router();

router.post("/api/users/registerfreela",
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
        const { email, password, firstName, lastName, birthDate, country, github, linkedin, nationality, personalWebsite, statement } = req.body;

        const existingFreela = await Freela.findOne({ email });

        if (existingFreela) {
            throw new BadRequestError("Email already in use");
        }

        const token = generateToken()
        const userType = "freela";

        const user = Freela.build({
            birthDate: birthDate,
            country: country,
            email: email,
            emailConfirmed: false,
            firstName: firstName,
            github: github,
            lastName: lastName,
            linkedin: linkedin,
            nationality: nationality,
            password: password,
            personalWebsite: personalWebsite,
            statement: statement,
            userType: userType,
            token: token
        })
        await user.save();

        const name = firstName + " " + lastName

        sendTokenEmail(email, name, token, userType, "Confirm Email")

        const userJwt = generateUserJwt(user.id, user.email, "freela")

        // Store it on session object
        req.session = {
            jwt: userJwt
        };

        res.status(201).send(user);
    });

export { router as registerFreelaRouter };