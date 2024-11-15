import request from "supertest";
import { app } from "../../app";
import { Company } from "../../models/Company";

describe("Login Company Route", () => {
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

    });
    it("returns 200 and a cookie on successful login", async () => {
        await request(app)
            .post("/api/users/registercompany")
            .send(validCompanyData)
            .expect(201);
        await request(app)
            .post("/api/users/registerhiringmanager")
            .send(validUserData)
            .expect(201);
        await request(app)
            .post("/api/users/logout")
            .expect(200);
        const response = await request(app)
            .post("/api/users/loginhiringmanager")
            .send({
                email: "john@freelas.com",
                password: "password123"
            })
            .expect(200);

        expect(response.get("Set-Cookie")).toBeDefined();
    });

    it("returns 400 when an email that does not exist is supplied", async () => {
        await request(app)
            .post("/api/users/loginhiringmanager")
            .send({
                email: "test@test.com",
                password: "freelastest"
            })
            .expect(400);
    });

    it("returns 400 when incorrect password is supplied", async () => {
        await request(app)
            .post("/api/users/registercompany")
            .send(validCompanyData)
            .expect(201);
        await request(app)
            .post("/api/users/registerhiringmanager")
            .send(validUserData)
            .expect(201);
        const response = await request(app)
            .post("/api/users/loginhiringmanager")
            .send({
                email: "john@freelas.com",
                password: "password"
            })
            .expect(400);
    });

    it("returns 400 when its not given an email or a password", async () => {
        await request(app)
            .post("/api/users/loginhiringmanager")
            .send({
                email: "test@example.com",
            })
            .expect(400);
        await request(app)
            .post("/api/users/loginhiringmanager")
            .send({
                password: "test@example.com",
            })
            .expect(400);
    });
});