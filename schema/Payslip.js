import { Schema, model, Types } from 'mongoose';

const payslipSchema = new Schema(
    {
        employeeId: { type: Types.ObjectId, required: true },
        from: {
            type: Date,
            required: true,
        },
        to: { type: Date, required: true },
        status: {
            type: String,
            required: true,
            enum: ['paid', 'unPaid'],
        },
        salary: { type: String, required: true },
        salaryType: { type: String, required: true },
        hraAllowance: { type: String, required: true },
        conveyance: { type: String, required: true },
        medicalAllowance: { type: String, required: true },
        bonusAllowance: { type: String, required: true },
        pf: { type: String, required: true },
        professionalTax: { type: String, required: true },
        tds: { type: String, required: true },
        loanAndOthers: { type: String, required: true, default: '' },
    },
    { timestamps: true }
);

export default model('payslip', payslipSchema);
