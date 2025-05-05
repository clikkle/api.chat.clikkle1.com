import { model, Schema, Types } from 'mongoose';


const organizationSchema = new Schema(
    {
        userId: { type: String, required: true },
        subscription: { type: Schema.Types.ObjectId, ref: 'subscription' },
        name: {
            type: String,
            trim: true,
            required: true,
        },
        status: {
            type: Boolean,
            required: true,
            default: false,
        },
        email: {
            type: String,
            trim: true,
            required: true,
        },
        plan: {
            type: String,
            default:"Starter Plan"
            // trim: true,
            // required: true,
        },
        portalName: {
            type: String,
            trim: true,
            required: true,
        },
        organizationSize: {
            type: String,
            trim: true,
            required: true,
        },
        industry: {
            type: String,
            trim: true,
            required: true,
        },
        website: {
            type: String,
            trim: true,
            required: true,
        },
        logo: {
            type: String,
            trim: true,
            required: true,
        }
    },
    { timestamps: true }
);

export default model('organization', organizationSchema);