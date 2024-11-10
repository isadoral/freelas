import mongoose from "mongoose"
import { Password } from "../services/password";

// @ADR
// Context: We need TypeScript to know the properties that are required to create a new Skill
// Decision: Create An interface that declares these properties, an interface that describes
// the properties that a Skill Model has, an interface that describes the properties that a Skill
// document has and give the skillSchema a build method.
// Consequence: We cannot create new Users using the mongoose documentation way, but instead
// we need to write a lot more (possibly confusing) code and use workarounds that teach
// TypeScript how to read and apply the types to this schema.


interface SkillAttributes {
    freela: string;
    domain: string;
    topic: string;
    tag: string;
    link: string;
    description: string;
    price: number[];
}

interface SkillModel extends mongoose.Model<SkillDoc> {
    build(attrs: SkillAttributes): SkillDoc;
}

interface SkillDoc extends mongoose.Document {
    freela: string;
    domain: string;
    topic: string;
    tag: string;
    link: string;
    description: string;
    price: number[];
}

const skillSchema = new mongoose.Schema({
    freela: {
        type: String,
        required: true
    },
    domain: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: [Number],
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});

skillSchema.pre("save", async function(done){
    if (this.isModified("password")) {
        const hashed = await Password.toHash(this.get("password"));
        this.set("password", hashed);
    }
    done();
});

skillSchema.statics.build = (attrs: SkillAttributes) => {
    return new Skill(attrs);
};

const Skill = mongoose.model<SkillDoc, SkillModel>("Skill", skillSchema);

export { Skill }