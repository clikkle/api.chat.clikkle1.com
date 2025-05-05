import { model, Schema, Types } from 'mongoose';

const rulesSchema = new Schema(
    { adminId: { type: Types.ObjectId, required: true },
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

export default model('rules', rulesSchema);
