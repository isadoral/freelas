import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import { validateRequest, BadRequestError } from "@izzietx/common";

import { Company } from "../models/Company";
import { generateToken } from "../services/Token";
import { sendTokenEmail } from "../services/SendEmail";
import { generateUserJwt } from "../services/JWT";

const router = express.Router();

router.post("/api/users/registercompany",
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
        const {
            email,
            password,
            name,
            address,
            countries,
            description,
            billingEmail,
            hiringManagers,
            logo,
            extra,
            website
        } = req.body;

        const existingCompany = await Company.findOne({ email });

        if (existingCompany) {
            throw new BadRequestError("Email already in use");
        }

        const token = generateToken();
        const userType = "company";

        const user = Company.build({
            address: {
                city: address.city,
                country: address.country,
                number: address.number,
                street: address.street,
                zipcode: address.zipcode
            },
            billingEmail: billingEmail,
            countries: countries,
            description: description,
            email: email,
            emailConfirmed: false,
            extra: extra,
            hiringManagers: hiringManagers,
            logo: logo,
            name: name,
            password: password,
            userType: userType,
            website: website,
            token: token
        });
        await user.save();

        // sendTokenEmail(email, name, token, userType, "Confirm Email");

        const userJwt = generateUserJwt(user.id, user.email, "company")

        // Store it on session object
        req.session = {
            jwt: userJwt
        };

        res.status(201).send(user);
    });

export { router as registerCompanyRouter };