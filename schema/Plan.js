import { model, Schema, Types } from 'mongoose';

const planSchema = new Schema(
    {
        name :{
            type: String,
            required: true,
        },
        description:{
            type: String,
            required: true,
        },
        interval: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        maxUser :{
            type: Number,
            required: true,  
        },
        maxOrg:{
            type: Number,
            required: true,  
        },
        product: {
            type: Object,
            // required: true,  
        },
        plan: {
            type: Object,
            required: true,  
        },
        trial: {
            type: String,
            required: true,
            default:7
        },
    },
    { timestamps: true }
);

export default model('plan', planSchema);