
import { model, Schema, Types } from 'mongoose';
const adminSchema = new Schema(
    {   
        clikkleId: { type: Types.ObjectId, required: true },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true
        },
        firstName: {
            type: String,
            trim: true,
            minlength: minlength('firstName', 3),
            maxlength: maxlength('firstName', 40),
            required: true,
        },
        lastName: {
            type: String,
            trim: true,
            maxlength: maxlength('firstName', 40),
        },
        phone: {
            type: String,
            sparse: true,
            // validate: {
            //     validator: function (v) {
            //         return phoneValidator;
            //     },
            //     message: props => `${props.value} is not a valid number.`,
            // }, bugfix
        },
        gender: {
            type: String,
            enum: ['male', 'female'],
            required: true,
        },
        photo: {
            type: Types.ObjectId,
        },
        dob: {
            type: Date,
            required: true,
        }
    },
    { timestamps: true, toJSON: { virtuals: true } }
);

export default model('admin', adminSchema);