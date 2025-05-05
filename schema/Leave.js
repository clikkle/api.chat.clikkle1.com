import { model, Schema, Types } from 'mongoose';
import CustomDate from './unCompiled/CustomDate.js';

const r = obj => ({ required: true, ...obj });

const leaveSchema = new Schema(
    {
        dates: [{ type: CustomDate }],
        leaveType: r({
            type: Types.ObjectId,
        }),

        reason: r({
            type: String,
        }),
        employeeId: r({
            type: Types.ObjectId,
        }),
        status: r({
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending',
        }),
    },
    {
        timestamps: true,
    }
);

export default model('leave', leaveSchema);
