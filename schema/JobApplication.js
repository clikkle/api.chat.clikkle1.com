import { model, Schema, Types } from 'mongoose';
import { emailValidator } from '../utils/validators.js';

const label = new Schema({
    status: { type: Types.ObjectId },
    modifiedBy: { type: String },
});

const interview = new Schema({
    date: { type: Date, required: true },
    time: { type: String, required: true },
    platform: { type: String, required: true },
});

const agreements = new Schema({
    agreementId: { type: Types.ObjectId, required: true },
    content: { type: String, required: true },
    title: { type: String, required: true },
    sign: { type: String, default: '' },
    signTime: { type: Date, default: '' },
});

const jobApplicationSchema = new Schema(
    {
        fullName: {
            type: String,
            trim: true,
            minlength: 3,
            maxlength: 100,
            required: true,
        },
        resume: {
            type: String,
            required: true,
            trim: true,
        },
        jobTitle: {
            type: String,
            trim: true,
            required: true,
        },
        experience: {
            type: Number,
            trim: true,
            required: true,
        },
        email: {
            type: String,
            trim: true,
            required: true,
            maxlength: 50,
            validate: {
                validator: emailValidator,
                message: props => `${props.value} is not a valid email address!`,
            },
        },
        countryCode: {
            type: String,
            required: true,
            maxlength: 10,
        },
        phone: {
            type: String,
            trim: true,
            required: true,
            maxlength: 10,
            minlength: 10,
        },
        linkedinAccount: {
            type: String,
            trim: true,
        },
        photo: {
            type: String,
            trim: true,
            required: true,
        },
        jobId: {
            type: Types.ObjectId,
            required: true,
        },
        userId: {
            type: Types.ObjectId,
            required: true,
        },
        adminId: { type: Types.ObjectId  ,
            required: true,
        },
     

        label: [label],
        status: { type: String, default: 'Pending', enum: ['Pending', 'Employed', 'Terminated'] },
        step: {
            type: Number,
            default: 0,
            required: true,
        },
        interview: {
            type: interview,
            required: function () {
                return this.step === 1;
            },
        },
        agreements: {
            type: [agreements],
            default: [],
            // required: function () {
            //     return this.step === 2;
            // },
            // validate: function () {
            //     return this.required
            //         ? {
            //               validator: v => v !== null && v.length > 0,
            //               message: `field 'agreements' is required`,
            //           }
            //         : {};
            // },
        },
    },

    {
        timestamps: true,
    }
);

export default model('jobApplication', jobApplicationSchema);
