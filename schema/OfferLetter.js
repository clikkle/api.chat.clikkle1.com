import { model, Schema, Types } from 'mongoose';

const r = obj => ({ required: true, ...obj });

const offerLetterSchema = new Schema({
    jobApplicationId: r({
        type: Types.ObjectId,
        unique: true,
    }),
    jobId: r({
        type: Types.ObjectId,
    }),
    userId: r({
        type: Types.ObjectId,
        //unique: true,
    }),
    jobTitle: r({
        type: String,
    }),
    jobDescription: r({
        type: String,
    }),
    nameOfEmployee: r({
        type: String,
    }),
    manager: {
        name: r({ type: String }),
        jobTitle: r({ type: String }),
    },
    team: r({ type: String }),
    probationaryPeriod: r({ type: Number }), // in months
    salary: {
        currency: r({ type: String }),
        amount: r({ type: Number }),
    },
    benefits: [r({ type: String })],
    allowance: [r({ type: String })],
    daysOff: {
        vacation: r({ type: String }),
        emergency: r({ type: String }),
    },
    TrainingBonus: r({ type: Number, default: 300 }),
    noticePeriod: r({ type: Number }), // in days
    effectiveDays: r({ type: Number }), // in business days
    candidateSign: {
        sign: { type: String },
        time: { type: Date },
    },
    hrSign: r({ type: String }),
});

export default model('offerLetter', offerLetterSchema);
