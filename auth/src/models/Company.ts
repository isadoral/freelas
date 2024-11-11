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


interface CompanyAttributes {
    email: string;
    password: string;
    emailConfirmed: boolean;
    token?: string;
    userType: string;
    name: string;
    address: {
        street: string;
        number: number;
        city: string;
        zipcode: string;
        country: string;
        extras?: string;
    };
    countries: string[];
    hiringManagers?: string[];
    billingEmail: string;
    description: string;
    website: string;
    logo?: string;
    extra?: string;
}

interface CompanyModel extends mongoose.Model<CompanyDoc> {
    build(attrs: CompanyAttributes): CompanyDoc;
}

interface CompanyDoc extends mongoose.Document {
    email: string;
    password: string;
    emailConfirmed: boolean;
    token?: string;
    userType: string;
    name: string;
    address: {
        street: string;
        number: number;
        city: string;
        zipcode: string;
        country: string;
        extras?: string;
    };
    countries: string[];
    hiringManagers?: string[];
    billingEmail: string;
    description: string;
    website: string;
    logo?: string;
    extra?: string;
}

const addressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    zipcode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    extras: {
        type: String,
        required: false
    },
});

const companySchema = new mongoose.Schema({
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
        required: false,
    },
    userType: {
        type: String,
        required: false,
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: addressSchema,
        required: true
    },
    countries: {
        type: [ String ],
        required: true,
    },
    hiringManagers: {
        type: [ String ],
        required: false
    },
    billingEmail: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    website: {
        type: String,
        required: true,
    },
    logo: {
        type: String,
        required: false,
    },
    extra: {
        type: String,
        required: false,
    },
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

companySchema.pre("save", async function(done){
    if (this.isModified("password")) {
        const hashed = await Password.toHash(this.get("password"));
        this.set("password", hashed);
    }
    done();
});

companySchema.statics.build = (attrs: CompanyAttributes) => {
    return new Company(attrs);
};

const Company = mongoose.model<CompanyDoc, CompanyModel>("Company", companySchema);

export { Company }