import request from "supertest";
import { app } from "../../app";
import { Freela } from "../../models/Freela";
import { generateToken } from "../../services/Token";
import { Company } from "../../models/Company";
import { HiringManager } from "../../models/HiringManager";

jest.mock("../../services/Token");
jest.mock("../../services/SendEmail");

describe("Register Hiring Manager Route", () => {

    const validCompanyData = {
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
    const validUserData = {
        email: "john@freelas.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        company: "freelas@freelas.com"
    };

    beforeEach(async () => {
        // Clear the database before each test
        await Company.deleteMany({});
        await HiringManager.deleteMany({})

    });

    it("returns 201 on successful registration", async () => {
        await request(app)
            .post("/api/users/registercompany")
            .send(validCompanyData)
            .expect(201);
        const response = await request(app)
            .post("/api/users/registerhiringmanager")
            .send(validUserData)
            .expect(201);

        // Check if user was created in database
        const user = await HiringManager.findOne({ email: validUserData.email });
        expect(user).toBeDefined();
        expect(user!.email).toEqual(validUserData.email);

        // Verify JWT was set in session
        expect(response.get("Set-Cookie")).toBeDefined();
    });

    it("returns 400 with invalid email", async () => {
        await request(app)
            .post("/api/users/registerhiringmanager")
            .send({
                ...validUserData,
                email: "invalid-email"
            })
            .expect(400);
    });

    it("returns 400 with invalid password", async () => {
        await request(app)
            .post("/api/users/registerhiringmanager")
            .send({
                ...validUserData,
                password: "pw" // too short
            })
            .expect(400);
    });

    it("returns 400 with existing email", async () => {
        await request(app)
            .post("/api/users/registercompany")
            .send(validCompanyData)
            .expect(201);
        // First registration
        await request(app)
            .post("/api/users/registerhiringmanager")
            .send(validUserData)
            .expect(201);

        // Second registration with same email
        await request(app)
            .post("/api/users/registerhiringmanager")
            .send(validUserData)
            .expect(400);
    });


    it("saves user with correct data", async () => {
        await request(app)
            .post("/api/users/registercompany")
            .send(validCompanyData)
            .expect(201);
        await request(app)
            .post("/api/users/registerhiringmanager")
            .send(validUserData)
            .expect(201);

        const user = await HiringManager.findOne({ email: validUserData.email });
        expect(user).toBeDefined();
        expect(user!.email).toEqual(validUserData.email);
        expect(user!.firstName).toEqual(validUserData.firstName);
        expect(user!.lastName).toEqual(validUserData.lastName);
        expect(user!.company).toEqual(validUserData.company);
        expect(user!.userType).toEqual("hiringManager");
        expect(user!.emailConfirmed).toEqual(false);
    });
});