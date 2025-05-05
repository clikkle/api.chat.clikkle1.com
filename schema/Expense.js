import { model, Schema, Types } from 'mongoose';
import CustomDate from './unCompiled/CustomDate.js';

const expenseSchema = new Schema(
    {
        employeeId: {
            type: Types.ObjectId,
            required: true,
        },
        title: {
            type: String,
            required: true,
            maxlength: 255,
        },
        purchasePlace: {
            type: String,
            required: true,
            maxlength: 255,
        },
        price: {
            amount: {
                type: Number,
                required: true,
            },
            currency: {
                type: String,
                required: true,
            },
        },
        dateOfPurchase: {
            type: CustomDate,
            required: true,
        },
        invoice: {
            type: String,
            required: true,
        },
        note: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        status: {
            type: String,
            enum: ['Approved', 'Rejected', 'Pending'],
            default: 'Pending',
        },
    },
    {
        timestamps: true,
    }
);

export default model('expense', expenseSchema);
