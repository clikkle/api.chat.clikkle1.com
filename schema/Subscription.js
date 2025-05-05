import { model, Schema, Types } from 'mongoose';

const periodSchema = new Schema(
    {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
    },
    { _id: false }
);

const subscriptionSchema = new Schema(
    {
        userId:  { type: String, required: true },
        plan: { type: Types.ObjectId , required: true},
        orgId: { type: Schema.Types.ObjectId, ref: 'organization',required:true },
        planName: {
            type: String,
            trim: true,
        },
        startDate: {
            type: Date,
            trim: true,
            required: true,
        },
        isActive :  {
            type: Boolean,
            required: true,
            default : false  
        },
        interval: {
            type: String,
            trim: true,
            required: true,
        },
        paymentId: {
            type: String,
            trim: true,
            required: true,
        },
        maxEmployee: {
            type: Number,
            trim: true,
            required: true,
        },
        maxOrganizations: {
            type: Number,
            trim: true,
            required: true,
        },
        subscription: {
            type: Object,
            required: true,
        },
        periods: [periodSchema],

    },
    { timestamps: true }
);

export default model('subscription', subscriptionSchema);