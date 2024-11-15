import request from "supertest";
import { app } from "../../app";
import { Company } from "../../models/Company";

jest.mock("../../services/Token");
jest.mock("../../services/SendEmail");

describe("Register Company Route", () => {
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
        billingEmail: "billings@freelas.com",
        description: "A company dedicated to making finding Freelancers or Freelance work easier",
        website: "www.freelas.com",
    };

    beforeEach(async () => {
        // Clear the database before each test
        await Company.deleteMany({});

    });

    it("returns 201 on successful registration", async () => {
        const response = await request(app)
            .post("/api/users/registercompany")
            .send(validUserData)
            .expect(201);

        // Check if user was created in database
        const user = await Company.findOne({ email: validUserData.email });
        expect(user).toBeDefined();
        expect(user!.email).toEqual(validUserData.email);

        // Verify JWT was set in session
        expect(response.get("Set-Cookie")).toBeDefined();
    });

    it("returns 400 with invalid email", async () => {
        await request(app)
            .post("/api/users/registercompany")
            .send({
                ...validUserData,
                email: "invalid-email"
            })
            .expect(400);
    });

    it("returns 400 with invalid password", async () => {
        await request(app)
            .post("/api/users/registercompany")
            .send({
                ...validUserData,
                password: "pw" // too short
            })
            .expect(400);
    });

    it("returns 400 with existing email", async () => {
        // First registration
        await request(app)
            .post("/api/users/registercompany")
            .send(validUserData)
            .expect(201);

        // Second registration with same email
        await request(app)
            .post("/api/users/registercompany")
            .send(validUserData)
            .expect(400);
    });


    it("saves user with correct data", async () => {
        await request(app)
            .post("/api/users/registercompany")
            .send(validUserData)
            .expect(201);

        const user = await Company.findOne({ email: validUserData.email });
        expect(user).toBeDefined();
        expect(user!.email).toEqual(validUserData.email);
        expect(user!.name).toEqual(validUserData.name);
        expect(user!.countries).toEqual(validUserData.countries);
        expect(user!.website).toEqual(validUserData.website);
        expect(user!.description).toEqual(validUserData.description);
        expect(user!.billingEmail).toEqual(validUserData.billingEmail);
        expect(user!.userType).toEqual("company");
        expect(user!.emailConfirmed).toEqual(false);
    });
});