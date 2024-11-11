import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import { errorHandler, NotFoundError } from "@izzietx/common";

import { currentUserRouter } from "./routes/CurrentUser";
import { logoutRouter } from "./routes/Logout";
import { registerCompanyRouter } from "./routes/RegisterCompany";
import { loginCompanyRouter } from "./routes/LoginCompany";
import { registerHiringManagerRouter } from "./routes/RegisterHiringManager";
import { registerFreelaRouter } from "./routes/RegisterFreela";
import { loginHiringManagerRouter } from "./routes/LoginHiringManager";
import { loginFreelaRouter } from "./routes/LoginFreela";
import { skillsRouter } from "./routes/Skills";
import { confirmEmailRouter } from "./routes/ConfirmEmail";
import { changePasswordRouter } from "./routes/ChangePassword";
import { changePasswordTokenRouter } from "./routes/ChangePasswordToken";
import { hiringManagerRouter } from "./routes/HiringManager";
import { companyRouter } from "./routes/Company";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
    cookieSession({
        signed: false,
        secure: process.env.NODE_ENV !== "test",
    })
);

app.use(currentUserRouter);
app.use(registerCompanyRouter);
app.use(registerHiringManagerRouter);
app.use(registerFreelaRouter);
app.use(loginCompanyRouter);
app.use(loginHiringManagerRouter);
app.use(loginFreelaRouter);
app.use(logoutRouter);
app.use(skillsRouter);
app.use(confirmEmailRouter);
app.use(changePasswordRouter);
app.use(changePasswordTokenRouter);
app.use(hiringManagerRouter);
app.use(companyRouter)

app.all("*", async (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };


