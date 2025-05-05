import { model, Schema, Types } from 'mongoose';

const paymentSchema = new Schema(
    {
        userId: { type: String, required: true },
        amount : {
            type: Number,
            required: true,
        },
        currency :{
            type: String,
            required: true,
        },
        customerId: {
            type: String,
            required: true,
        },
        planId: {
            type: String,
            required: true,
        },
        card :{
            type: Object,
            required: true,  
        },
        cardToken:{
            type: String,
            required: true,  
        },
        

    },
    { timestamps: true }
);

export default model('payment', paymentSchema);