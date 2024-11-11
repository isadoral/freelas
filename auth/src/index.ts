import mongoose from "mongoose";
import { app } from "./app";
import { generateToken } from "./services/Token";
import Mailjet from "node-mailjet";

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY must be defined");
    }
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI must be defined");
    }
    if (!process.env.MAILJET_API_KEY){
        throw new Error("MAILJET_API_KEY must be defined");
    }
    if (!process.env.MAILJET_SECRET_KEY){
        throw new Error("MAILJET_SECRET_KEY must be defined");
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB")
    } catch (err) {
        console.log(err);
    }

    app.listen(3000, () => {
        console.log("Listening on port 3000");
    });
};

start();