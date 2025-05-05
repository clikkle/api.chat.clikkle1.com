import { model, Schema ,Types } from 'mongoose';

const r = obj => ({ required: true, ...obj });

const listItemSchema = new Schema({
    value: { type: String, required: true },
    createdBy: { type: String },
});

const listSchema = new Schema({
    adminId: { type: Types.ObjectId, required: true },
    name: { type: String, required: true,  },
    items: [listItemSchema],
    metaData: { type: Object },
});

listSchema.index({ adminId: 1, name: 1 }, { unique: true });

export default model('list', listSchema);
