import { model, Schema, Types } from 'mongoose';

const r = obj => ({ required: true, ...obj });

const notificationSchema = new Schema({
    title: r({
        type: String,
    }),
    description: r({
        type: String,
    }),
    // type: r({
    //     type: String,
    //     enum: ['Important'],
    // }),
    employeeId: r({
        type: Types.ObjectId,
    }),
    createdAt: r({
        type: Date,
        index: true,
        default: () => new Date(),
    }),
});

export default model('notification', notificationSchema);
