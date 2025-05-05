import { Schema, model , Types } from 'mongoose';

const schema = new Schema({
    adminId: { type: Types.ObjectId, required: true },
    name: { type: String, required: true },
});

export default model('department', schema);
