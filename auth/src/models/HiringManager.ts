import mongoose from "mongoose"
import { Password } from "../services/Password";

// @ADR
// Context: We need TypeScript to know the properties that are required to create a new User
// Decision: Create An interface that declares these properties, an interface that describes
// the properties that a User Model, an interface that describes the properties that a User
// document has and give the userSchema a build method.
// Consequence: We cannot create new Users using the mongoose documentation way, but instead
// we need to write a lot more (possibly confusing) code and use workarounds that teach
// TypeScript how to read and apply the types to this schema.

// @ADR
// Context: We need to distinguish between the three types of users (Companies, Hiring Managers, and
// Freelas) and their different schemas. Using Mongoose Discriminators in one User model proved
// challenging because it was not possible to use findOne to find a user.
// Decision: Create a separate Model for each type of User
// Consequence: Unfortunately repeated code and more complicated implementation for login and create
// account


interface HiringManagerAttributes {
    email: string;
    password: string;
    emailConfirmed: boolean;
    token?: string;
    userType: string;
    firstName: string;
    lastName: string;
    company: string;
}

interface HiringManagerModel extends mongoose.Model<HiringManagerDoc> {
    build(attrs: HiringManagerAttributes): HiringManagerDoc;
}

interface HiringManagerDoc extends mongoose.Document {
    email: string;
    password: string;
    emailConfirmed: boolean;
    token?: string;
    userType: string;
    firstName: string;
    lastName: string;
    company: string;
}

const hiringManagerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    emailConfirmed: {
        type: Boolean,
        required: true,
    },
    token: {
        type: String,
    },
    userType: {
        type: String,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    company: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.token;
            delete ret.__v;
        }
    }
});

hiringManagerSchema.pre("save", async function(done){
    if (this.isModified("password")) {
        const hashed = await Password.toHash(this.get("password"));
        this.set("password", hashed);
    }
    done();
});

hiringManagerSchema.statics.build = (attrs: HiringManagerAttributes) => {
    return new HiringManager(attrs);
};

const HiringManager = mongoose.model<HiringManagerDoc, HiringManagerModel>("HiringManager", hiringManagerSchema);

export { HiringManager }