import { CustomError } from "./CustomError";

export class NotAuthorisedError extends CustomError {
    statusCode = 401;

    constructor() {
        super("Not Authorized");

        Object.setPrototypeOf(this, NotAuthorisedError.prototype)
    }


    serializeErrors(): { message: string; field?: string }[] {
        return [{ message: "Not Authorised" }];
    }
}