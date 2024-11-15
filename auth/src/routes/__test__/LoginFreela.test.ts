import request from "supertest";
import { app } from "../../app";
import { Freela } from "../../models/Freela";

describe("Login Freela Route", () => {
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
    it("returns 200 and a cookie on successful login", async () => {
        await request(app)
            .post("/api/users/registerfreela")
            .send(validUserData)
            .expect(201);
        await request(app)
            .post("/api/users/logout")
            .expect(200);
        const response = await request(app)
            .post("/api/users/loginfreela")
            .send({
                email: "test@example.com",
                password: "password123"
            })
            .expect(200);

        expect(response.get("Set-Cookie")).toBeDefined();
    });

    it("returns 400 when an email that does not exist is supplied", async () => {
        await request(app)
            .post("/api/users/loginfreela")
            .send({
                email: "test@test.com",
                password: "password"
            })
            .expect(400);
    });

    it("returns 400 when incorrect password is supplied", async () => {
        await request(app)
            .post("/api/users/registerfreela")
            .send(validUserData)
            .expect(201);
        await request(app)
            .post("/api/users/logout")
            .expect(200);
        const response = await request(app)
            .post("/api/users/loginfreela")
            .send({
                email: "test@example.com",
                password: "password"
            })
            .expect(400);
    });

    it("returns 400 when its not given an email or a password", async () => {
        await request(app)
            .post("/api/users/loginfreela")
            .send({
                email: "test@example.com",
            })
            .expect(400);
        await request(app)
            .post("/api/users/loginfreela")
            .send({
                password: "test@example.com",
            })
            .expect(400);
    });
});