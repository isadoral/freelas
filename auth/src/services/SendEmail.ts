import Mailjet, { Client } from "node-mailjet";
import { BadRequestError } from "@izzietx/common/build";

let mailjet:Client;

if (process.env.env !== "dev") {
     mailjet = Mailjet.apiConnect(
        process.env.MAILJET_API_KEY!,
        process.env.MAILJET_SECRET_KEY!,
    );
}

export const sendTokenEmail = (email: string, name: string, token: string, userType: string, action: string) => {

    let link = "";
    let subject = "";
    let text = "";
    let html = "";

    if (action === "Confirm Email") {
        subject = "Confirm Your Email";
        text = "Please Confirm Your Email";
        link = "http://www.freela.comusers/api/users/confirmEmail?token=" + token + "&userType=" + userType;
        html = "<h1>Welcome to Freela!</h1> <br> <p>Please confirm your email address by clicking the link below.</p> <br> <a href=" +
            link +
            " >Confirm Email</a>";

    } else if (action === "Change Password") {
        subject = "Change Your Password";
        text = "To change your password please follow these steps:";
        link = "http://www.freela.comusers/api/users/changepasswordl?token=" + token + "&userType=" + userType;
        html = "<h1>Welcome back to Freela!</h1> <br> <p>To continue changing your password please use the following link: </p> <br> <a href=" +
            link +
            " >Change Password</a><br/> <p>If you didn't request to change your password please get in contact with our support team.</p>";

    } else {
        throw new BadRequestError("Something went wrong")
    }

    const request = mailjet
        .post("send", { version: "v3.1" })
        .request({
            Messages: [
                {
                    From: {
                        Email: "isadora.lopes@code.berlin",
                        Name: "Freela"
                    },
                    To: [
                        {
                            Email: email,
                            Name: name
                        }
                    ],
                    Subject: subject,
                    TextPart: text,
                    HTMLPart: html
                }
            ]
        });
    request
        .catch((err) => {
            console.log(err.statusCode);
        });

};

