import { model, Schema, Types } from 'mongoose';

const noticeSchema = new Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true,
        },
        content: {
            type: String,
            trim: true,
            required: true,
        },
        departmentIds: [Types.ObjectId],
        adminId: { type: Types.ObjectId, required: true },

        status: { type: String, enum: ['active', 'inActive'], default: 'active' },
    },
    {
        timestamps: true,
    }
);

export default model('notice', noticeSchema);
