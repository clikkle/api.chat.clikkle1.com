import { model, Schema, Types } from 'mongoose';

const docsSchema = new Schema(
    {
        title: {
            type: String,
            trim: true,
            required: true,
        },
        jobIds: [Types.ObjectId],
        content: {
            type: String,
            trim: true,
            required: true,
        },
        filenames: { type: [String], default: [] },
        adminId: { type: Types.ObjectId, required: true }, // Add adminId field
    },
    { timestamps: true }
);

export default model('docs', docsSchema);
