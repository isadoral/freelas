import mongoose from "mongoose"

// @ADR
// Context: We need TypeScript to know the properties that are required to create a new Proposal
// Decision: Create An interface that declares these properties, an interface that describes
// the properties that a Proposal Model has, an interface that describes the properties that a Proposal
// document has and give the proposalSchema a build method.
// Consequence: We cannot create new Users using the mongoose documentation way, but instead
// we need to write a lot more (possibly confusing) code and use workarounds that teach
// TypeScript how to read and apply the types to this schema.


interface ProposalAttributes {
    job: string;
    company: string;
    freela: string;
    status: string; // available, in progress, completed
    initiator: string;
    timeline: {
        startDate: Date,
        endDate: Date
    };
    price: number
}

interface ProposalModel extends mongoose.Model<ProposalDoc> {
    build(attrs: ProposalAttributes): ProposalDoc;
}

interface ProposalDoc extends mongoose.Document {
    job: string;
    company: string;
    freela: string;
    status: string; // available, in progress, completed
    initiator: string;
    timeline: {
        startDate: Date,
        endDate: Date
    };
    price: number
}

const proposalSchema = new mongoose.Schema({
    job: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    freela: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    }, // pending, accepted, rejected
    initiator: {
        type: String,
        required: true
    },
    timeline: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
    },
    price: {
        type: Number,
        required: true
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        }
    }
});

proposalSchema.statics.build = (attrs: ProposalAttributes) => {
    return new Proposal(attrs);
};

const Proposal = mongoose.model<ProposalDoc, ProposalModel>("Proposal", proposalSchema);

export { Proposal }