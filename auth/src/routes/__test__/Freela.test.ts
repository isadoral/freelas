import request from "supertest";
import { app } from "../../app";
import { Freela } from "../../models/Freela";

describe("Freela Routes", () => {
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
    const userChange = {
        firstName: "John",
        lastName: "Doe",
        country: "Italy",
        github: "https://github.com/johndoe",
        linkedin: "https://linkedin.com/in/johndoe",
        nationality: "Italian",
        personalWebsite: "https://johndoe.com",
        statement: "I am a freelancer"
    };


    beforeEach(async () => {
        // Clear the database before each test
        await Freela.deleteMany({});

    });

    it("returns 201 on successful freela update", async () => {
        const cookie = await global.signin();
        await request(app)
            .patch("/api/users/freela")
            .set("Cookie", cookie)
            .send(userChange)
            .expect(201);

        const freela = await Freela.findOne({ email: validUserData.email });
        expect(freela).toBeDefined();
        expect(freela!.nationality).toEqual(userChange.nationality)
        expect(freela!.country).toEqual(userChange.country)

    });

    // it("returns 200 on successful freela deletion", async () => {
    //     const cookie = await global.signin();
    //     await request(app)
    //         .del("/api/users/freela")
    //         .set("Cookie", cookie)
    //         .expect(200);
    //
    //     const freela = await Freela.findOne({ email: validUserData.email });
    //     expect(freela).not.toBeDefined();
    //
    // });


});