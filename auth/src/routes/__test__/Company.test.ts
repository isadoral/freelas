import request from "supertest";
import { app } from "../../app";
import { Freela } from "../../models/Freela";
import { Company } from "../../models/Company";

describe("Company Routes", () => {
    const userChange = {
        countries: ["United States of America", "Germany", "Italy"],
        billingEmail: "billings@freelas.com",
        description: "A company dedicated to making finding Freelancers or Freelance work easier",
        website: "www.freelas.com",
        logo: "",
        extra: "",
    };


    beforeEach(async () => {
        // Clear the database before each test
        await Company.deleteMany({});

    });

    it("returns 201 on successful company update", async () => {
        const cookie = await global.companySignin();
        await request(app)
            .patch("/api/users/company")
            .set("Cookie", cookie)
            .send(userChange)
            .expect(201);

        const company = await Company.findOne({ email: "freelas@freelas.com" });
        expect(company).toBeDefined();
        expect(company!.countries).toEqual(userChange.countries)

    });

    // it("returns 200 on successful company deletion", async () => {
    //     const cookie = await global.companySignin();
    //     await request(app)
    //         .del("/api/users/company")
    //         .set("Cookie", cookie)
    //         .expect(200);
    //
    //     const company = await Company.findOne({ email: "freelas@freelas.com" });
    //     expect(company).not.toBeDefined();
    //
    // });


});