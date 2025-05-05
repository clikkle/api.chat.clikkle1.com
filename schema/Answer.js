import { Schema, model, Types } from 'mongoose';

const required = true;

const answer = new Schema({
    questionId: { type: Types.ObjectId, required },
    answer: { type: String, required, enum: ['a', 'b', 'c', 'd'] },
});

const answerSchema = new Schema({
    jobId: { type: Types.ObjectId, required },
    userId: { type: Types.ObjectId, required },
    timeTaken: { type: String, required },
    answers: {
        type: [answer],
        required: true,
        validate: {
            validator: v => v !== null && v.length > 0,
            message: `field 'answer' is required`,
        },
    },
    score: { type: Number, default: 0 },
});

export default model('answer', answerSchema);
