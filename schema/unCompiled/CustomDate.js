import { Schema } from 'mongoose';

export default new Schema({
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    day: { type: Number, required: true },
});
