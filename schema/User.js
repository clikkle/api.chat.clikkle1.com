import { model, Schema, Types } from 'mongoose';
import bcrypt from 'bcrypt';
import { emailValidator } from '../utils/validators.js';

const minlength = function (field, length) {
    return [length, `${field} must be at least (${length}) characters long`];
};

const maxlength = function (field, length) {
    return [length, `${field} must be at least (${length}) characters long`];
};

const userSchema = new Schema(
    {     
        adminId: { type: Types.ObjectId },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
            validate: {
                validator: emailValidator,
                message: props => `${props.value} is not a valid email address!`,
            },
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
        password: {
            type: String,
            minlength: 8,
            required: true,
        },
        role: {
            type: String,
            enum: ['user', 'employee', 'hr'],
            default: 'user',
            required: true,
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
        },
        otp: {
            phone: { type: String },
            email: { type: String },
        },
    },
    { timestamps: true, toJSON: { virtuals: true } }
);

const convertPasswordToHash = async function (next) {
    if (this.isModified('password')) {
        this.password = await this.convertPasswordToHash(this.password);
    }
    next();
};

userSchema.pre(['save'], convertPasswordToHash);

userSchema.methods = {
    isAuthorized: async function (password) {
        return bcrypt.compare(password, this.password);
    },
    isUnauthorized: async function (password) {
        const authorized = await this.isAuthorized(password);
        return !authorized;
    },
    convertPasswordToHash: async function (password) {
        const saltRounds = 10;
        return bcrypt.hash(password, saltRounds);
    },
    removeSensitiveInfo: function () {
        this.password = undefined;
        this.otp = undefined;
    },
};

userSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName;
});

export default model('User', userSchema);
