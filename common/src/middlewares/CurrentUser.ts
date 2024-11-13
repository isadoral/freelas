import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


// @ADR
// Context: We need to define req.currentUser to return the current user data to be used by other
// middlewares or the actual request handler.
// Decision: Create An interface that defines the type of payload that we get back from jwt.Verify
// and add the new property to the Request interface.
// Consequence: We need to do changes to the interface of Request to add a new property.

interface UserPayload {
    id: string;
    email: string;
    userType: string;
}

declare global {
    namespace Express {
        interface Request {
            currentUser?: UserPayload;
        }
    }
}

export const currentUser = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if  (!req.session?.jwt) {
        return next();
    }
    try {
        const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload;
        req.currentUser = payload;
    } catch (err) {
        next();
    }

    next();
};