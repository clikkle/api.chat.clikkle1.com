import { model, Schema, Types } from 'mongoose';

const detailsSchema = new Schema({
    content: { type: String, trim: true },
    tag: {
        type: String,
        required: true,
        enum: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'],
    },
});

const jobListingSchema = new Schema({
    adminId: { type: Types.ObjectId, required: true },
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
        trim: true,
    },
    department: {
        type: Types.ObjectId,
        required: true,
        trim: true,
        maxlength: 30,
    },
    jobType: {
        type: String,
        required: true,
        trim: true,
        enum: ['Part Time', 'Full Time'],
    },
    location: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    experience: {
        type: Number,
        required: true,
    },
    details: {
        type: [detailsSchema],
        required: true,
    },
    salary: {
        amount: {
            type: Number,
            required: true,
            trim: true,
        },
        currency: {
            type: String,
            required: true,
        },
    },
    remote: {
        type: Boolean,
        required: true,
    },
    order: {
        type: Number,
        required: true,
    },
});

export default model('jobListing', jobListingSchema, );




