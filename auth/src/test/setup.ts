import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";
import request from "supertest";

declare global {
    var signin: () => Promise<string[]>;

}
declare global {
    var companySignin: () => Promise<string[]>;

}

process.env.env = "dev"

let mongo: any;

beforeAll(async () => {
    process.env.JWT_KEY = "teststring"
    process.env.env = "dev"

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri()

    await mongoose.connect(mongoUri, {});
})

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});

global.signin = async () => {
    const validUserData = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        birthDate: "1990-01-01",
        country: "United States",
        github: "https://github.com/johndoe",
        linkedin: "https://linkedin.com/in/johndoe",
        nationality: "American",
        personalWebsite: "https://johndoe.com",
        statement: "I am a freelancer"
    };

   const response = await request(app)
        .post("/api/users/registerfreela")
        .send(validUserData)
        .expect(201);
    const cookie = response.get("Set-Cookie");

    return cookie;
}

global.companySignin = async () => {
    const validUserData = {
        email: "freelas@freelas.com",
        password: "freelastest",
        name: "Freelas GmbH",
        address: {
            street: "Pennsylvania Avenue",
            number: 1600,
            city: "Washington",
            zipcode: "20500",
            country: "United States of America",
        },
        countries: ["United States of America", "Germany"],
        hiringManagers: ["john@freelas.com"],
        billingEmail: "billings@freelas.com",
        description: "A company dedicated to making finding Freelancers or Freelance work easier",
        website: "www.freelas.com",
    };

    const response = await request(app)
        .post("/api/users/registercompany")
        .send(validUserData)
        .expect(201);
    const cookie = response.get("Set-Cookie");

    return cookie;
}