import { model, Schema, Types } from 'mongoose';

const r = obj => ({ required: true, ...obj });

const leaveTypeSchema = new Schema(
    { adminId: { type: Types.ObjectId, required: true },
        name: r({
            type: String,
            unique: true,
        }),
        noOfLeaves: r({
            type: Number,
        }),
    },
    {
        timestamps: true,
    }
);

export default model('leaveType', leaveTypeSchema);
