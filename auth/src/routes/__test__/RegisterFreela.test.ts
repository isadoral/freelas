import request from "supertest";
import { app } from "../../app";
import { Freela } from "../../models/Freela";

jest.mock("../../services/Token");
jest.mock("../../services/SendEmail");

describe("Register Freela Route", () => {
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

    beforeEach(async () => {
        // Clear the database before each test
        await Freela.deleteMany({});

    });

    it("returns 201 on successful registration", async () => {
        const response = await request(app)
            .post("/api/users/registerfreela")
            .send(validUserData)
            .expect(201);

        // Check if user was created in database
        const user = await Freela.findOne({ email: validUserData.email });
        expect(user).toBeDefined();
        expect(user!.email).toEqual(validUserData.email);

        // Verify JWT was set in session
        expect(response.get("Set-Cookie")).toBeDefined();
    });

    it("returns 400 with invalid email", async () => {
        await request(app)
            .post("/api/users/registerfreela")
            .send({
                ...validUserData,
                email: "invalid-email"
            })
            .expect(400);
    });

    it("returns 400 with invalid password", async () => {
        await request(app)
            .post("/api/users/registerfreela")
            .send({
                ...validUserData,
                password: "pw" // too short
            })
            .expect(400);
    });

    it("returns 400 with existing email", async () => {
        // First registration
        await request(app)
            .post("/api/users/registerfreela")
            .send(validUserData)
            .expect(201);

        // Second registration with same email
        await request(app)
            .post("/api/users/registerfreela")
            .send(validUserData)
            .expect(400);
    });


    it("saves user with correct data", async () => {
        await request(app)
            .post("/api/users/registerfreela")
            .send(validUserData)
            .expect(201);

        const user = await Freela.findOne({ email: validUserData.email });
        expect(user).toBeDefined();
        expect(user!.email).toEqual(validUserData.email);
        expect(user!.firstName).toEqual(validUserData.firstName);
        expect(user!.lastName).toEqual(validUserData.lastName);
        expect(user!.country).toEqual(validUserData.country);
        expect(user!.github).toEqual(validUserData.github);
        expect(user!.linkedin).toEqual(validUserData.linkedin);
        expect(user!.nationality).toEqual(validUserData.nationality);
        expect(user!.personalWebsite).toEqual(validUserData.personalWebsite);
        expect(user!.statement).toEqual(validUserData.statement);
        expect(user!.userType).toEqual("freela");
        expect(user!.emailConfirmed).toEqual(false);
    });
});