import { model, Schema, Types } from 'mongoose';

const awardSchema = new Schema(
    {
        employeeId: { type: Types.ObjectId, required: true },
        gift: {
            type: String,
            trim: true,
            required: true,
        },
        name: {
            type: String,
            trim: true,
            required: true,
        },
        description: {
            type: String,
            trim: true,
            required: true,
        },
        adminId: { type: Types.ObjectId, required: true },

    },
    { timestamps: true }
);

export default model('award', awardSchema);
