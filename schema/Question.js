import { Schema, model, Types } from 'mongoose';

const required = true;

const question = new Schema({
    question: { type: String, required, trim: true },
    options: {
        a: { type: String, required, trim: true },
        b: { type: String, required, trim: true },
        c: { type: String, required, trim: true },
        d: { type: String, required, trim: true },
    },
    answer: { type: String, required, enum: ['a', 'b', 'c', 'd'] },
});

const questionSchema = new Schema({
    jobId: { type: Types.ObjectId, required: true },
    questions: {
        type: [question],
        required: true,
        validate: {
            validator: v => v !== null && v.length > 0,
            message: `field 'questions' is required`,
        },
    },
    adminId: { type: Types.ObjectId, required: true }, // Added adminId field

});

export default model('question', questionSchema);
