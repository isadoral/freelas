import { Request,  Response, NextFunction } from "express";
import {NotAuthorisedError} from "../errors/NotAuthorisedError";

export const requireAuthCompany = (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
        throw new NotAuthorisedError();
    } if (req.currentUser.userType === "freela") {
        throw new NotAuthorisedError();
    }

    next();
}