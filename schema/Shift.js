import { Schema, model, Types } from 'mongoose';
import CustomDate from './unCompiled/CustomDate.js';

const required = function () {
    return this.status !== 'Leave';
};

const schema = new Schema({
    employeeId: { type: Types.ObjectId, required },
    adminId :{ type: Types.ObjectId, required },
    ip: { type: String, required },
    clockInTime: { type: Date, required },
    clockOutTime: {
        type: Date,
    },
    clockInDate: { type: CustomDate, required },
    status: {
        type: String,
        required: true,
        enum: ['Present', 'Late', 'Half-Day', 'Leave'],
    },
    note: { type: String },
});

export default model('shift', schema);
