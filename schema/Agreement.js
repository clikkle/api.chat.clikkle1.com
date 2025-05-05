import { Schema, model, Types } from 'mongoose';

const required = obj => ({ required: true, ...obj });

const agreements = new Schema({
    agreementId: { type: Types.ObjectId, required: true },
    content: { type: String, required: true },
    sign: { type: String, required: true },
    signTime: { type: Date, required: true },
});

const agreementSchema = new Schema(
    {
        jobApplicationId: required({
            type: Types.ObjectId,
            unique: true,
        }),
        jobId: required({
            type: Types.ObjectId,
        }),
        userId: required({
            type: Types.ObjectId,
            unique: true,
        }),
        agreements: {
            type: [agreements],
            validate: {
                validator: v => v !== null && v.length > 0,
                message: `field 'agreements' is required`,
            },
        },
    },
    { timestamps: true }
);

export default model('agreement', agreementSchema);
