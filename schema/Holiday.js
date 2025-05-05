import { model, Schema, Types } from 'mongoose';

const r = obj => ({ required: true, ...obj });

const holidaySchema = new Schema({
    adminId: { type: Types.ObjectId, required: true },
    title: r({
        type: String,
    }),
    from: r({ type: Date, index: true }),
    to: r({ type: Date, index: true }),
    // date: r({ type: Date, index: true }),
});

export default model('holiday', holidaySchema);
