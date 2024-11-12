import express from "express";
import "express-async-errors";
import { json } from 'body-parser';
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError, currentUser } from "@izzietx/common"

import { jobRouter } from "./routes/Job";
import { proposalRouter } from "./routes/Proposal";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== "test",
    })
)
app.use(currentUser);

app.use(jobRouter);
app.use(proposalRouter);

app.all("*", async (req, res) => {
    throw new NotFoundError();
})

app.use(errorHandler);

export { app }


