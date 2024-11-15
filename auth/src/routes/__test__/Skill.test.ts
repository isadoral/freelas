import request from "supertest";
import { app } from "../../app";
import { Freela } from "../../models/Freela";
import { Skill } from "../../models/Skill";

describe("Skills Routes", () => {

    const skillData = {
        description: "description",
        freela: "test@example.com",
        domain: "Software Engineering",
        link: "github.com/something",
        price: [ 50, 100 ],
        tag: "express",
        topic: "backend",
    };

    const skillData2 = {
        tag: "express",
        description: "description description",
        link: "github.com/something",
        price: [ 50, 100 ],
    };

    beforeEach(async () => {
        // Clear the database before each test
        await Skill.deleteMany({});

    });

    it("returns 201 on successful skill creation", async () => {
        const cookie = await global.signin();
        await request(app)
            .post("/api/users/skill")
            .set("Cookie", cookie)
            .send(skillData)
            .expect(201);

        const skill = await Skill.findOne({ freela: "test@example.com", tag: skillData.tag });
        expect(skill).toBeDefined();
        expect(skill!.tag).toEqual(skillData.tag);

    });

    it("returns 401 on attempt at skill creation without authentication", async () => {
        await request(app)
            .post("/api/users/skill")
            .send(skillData)
            .expect(401);

    });

    it("returns 201 on successful skill update", async () => {
        const cookie = await global.signin();
        await request(app)
            .post("/api/users/skill")
            .set("Cookie", cookie)
            .send(skillData)
            .expect(201);
        await request(app)
            .patch("/api/users/skill")
            .set("Cookie", cookie)
            .send(skillData2)
            .expect(201);

        const skill = await Skill.findOne({ freela: "test@example.com", tag: skillData.tag });
        expect(skill).toBeDefined();
        expect(skill!.tag).toEqual(skillData.tag);
        expect(skill!.description).toEqual(skillData2.description)

    });

    // it("returns 200 on successful skill deletion", async () => {
    //     const cookie = await global.signin();
    //     const tag = "express"
    //     await request(app)
    //         .post("/api/users/skill")
    //         .set("Cookie", cookie)
    //         .send(skillData)
    //         .expect(201);
    //     await request(app)
    //         .delete("/api/users/skill")
    //         .set("Cookie", cookie)
    //         .send(tag)
    //         .expect(200);
    //
    //     const skill = await Skill.findOne({ freela: "test@example.com", tag: skillData.tag });
    // });

});