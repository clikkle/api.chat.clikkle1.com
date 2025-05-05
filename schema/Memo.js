import { model, Schema, Types } from 'mongoose';

const memoSchema = new Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true,
        },
        description: {
            type: String,
            trim: true,
            required: true,
        },
        departmentIds: [Types.ObjectId],
        adminId: { type: Types.ObjectId, required: true },
    },
    {
        timestamps: true,
    }
);

export default model('memo', memoSchema);
