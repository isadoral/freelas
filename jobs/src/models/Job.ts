import mongoose from "mongoose"

// @ADR
// Context: We need TypeScript to know the properties that are required to create a new Job
// Decision: Create An interface that declares these properties, an interface that describes
// the properties that a Job Model has, an interface that describes the properties that a Job
// document has and give the jobSchema a build method.
// Consequence: We cannot create new Users using the mongoose documentation way, but instead
// we need to write a lot more (possibly confusing) code and use workarounds that teach
// TypeScript how to read and apply the types to this schema.


interface JobAttributes {
    projectName: string;
    company: string;
    freela?: string;
    skill: {
        domain: string,
        topic: string,
        tag: string,
    }
    description: string;
    status: string; // available, in progress, completed
    timeline: {
        startDate: Date,
        endDate: Date
    };
    budget: number[];
    finalPrice?: number;
    extras?: string;
}

interface JobModel extends mongoose.Model<JobDoc> {
    build(attrs: JobAttributes): JobDoc;
}

interface JobDoc extends mongoose.Document {
    projectName: string;
    company: string;
    freela?: string;
    skill: {
        domain: string,
        topic: string,
        tag: string,
    }
    description: string;
    status: string; // available, in progress, completed
    timeline: {
        startDate: Date,
        endDate: Date
    };
    budget: number[];
    finalPrice?: number;
    extras: string;
}

const jobSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    freela: {
        type: String,
        required: false
    },
    skill: {
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
    },
    description: {
        type: String,
        required: true
    },
    status: {
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
    budget: {
        type: [Number],
        required: true
    },
    finalPrice: {
        type: Number,
        required: false
    },
    extras: {
        type: String,
        required: false
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

jobSchema.statics.build = (attrs: JobAttributes) => {
    return new Job(attrs);
};

const Job = mongoose.model<JobDoc, JobModel>("Job", jobSchema);

export { Job }