import { DateTime } from 'luxon';
import { Schema, Types, model } from 'mongoose';
import Shift from './Shift.js';

const Time = new Schema({
    hour: { type: Number, required: true },
    minute: { type: Number, required: true },
});

const bankDetail = new Schema({
    accountHolder: { type: String, required: true },
    accountNumber: { type: String, required: true, trim: true },
    bankName: { type: String, required: true },
    branch: { type: String, required: true },
    ifsc: { type: String, required: true, trim: true },
    pan: { type: String, trim: true },
    city: { type: String },
    state: { type: String },
    country: { type: String },
});

const employee = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String },
    fatherName: { type: String },
    phone: {
        countryCode: { type: String },
        phone: { type: String },
    },
    emergencyContact: { type: String },
    dob: { type: Date },
    gender: {
        type: String,
        enum: ['male', 'female', 'non-binary', 'Male', 'Female', 'Non-binary'],
    },
    maritalStatus: {
        type: String,
        enum: ['', 'Married', 'Widowed', 'Separated', 'Divorced', 'Single'],
    },
    bloodGroup: {
        type: String,
        enum: ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    email: { type: String, required: true },
    presentAddress: { type: String },
    permanentAddress: { type: String },
    photo: { type: String, default: null },
    department: { type: Types.ObjectId, required: true },
    designation: { type: Types.ObjectId, required: true },
    role: { type: String },
    dateOfJoining: { type: Date, required: true },
    salary: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
    },
    shiftStart: { type: Time, required: true },
    shiftEnd: { type: Time, required: true },
    timezone: { type: String, required: true },
    jobType: {
        type: String,
        required: true,
        trim: true,
        enum: ['Part Time', 'Full Time'],
    },
    bank: { type: bankDetail },
    status: {
        type: String,
        default: 'Active',
        required: true,
        trim: true,
        enum: ['Active', 'Terminated'],
    },
    userId: { type: Types.ObjectId },
    adminId: { type: Types.ObjectId, required: true }, // Add adminId field
});

employee.virtual('shiftStartToday').get(function () {
    return this.getRelativeTime({
        hour: this.shiftStart.hour,
        minute: this.shiftStart.minute,
    });
});

employee.virtual('shiftEndToday').get(function () {
    let shiftEnd = this.getRelativeTime({
        hour: this.shiftEnd.hour,
        minute: this.shiftEnd.minute,
    });

    // if shiftEnd is before the shiftStart, it means that the shift will end on the next day
    if (shiftEnd < this.shiftStartToday) {
        shiftEnd = shiftEnd.plus({ day: 1 });
    }

    return shiftEnd;
});

employee.methods.isInWorkingHours = function () {
    const now = this.getRelativeTime();
    return this.shiftStartToday <= now && now <= this.shiftEndToday;
};

employee.methods.getShift = async function () {
    // const isClockedOutYesterday = await this.hasClockedOutYesterday(); 
    // if (!isClockedOutYesterday) {
    //     this.shift = await this.hasClockedOutYesterday("getshift"); 
    //     // console.log("Yesterday hasClockedOutYesterday",this.shift); //!
    //     return this.shift;
    // }
    if (isUndefined(this.shift))
        this.shift = await Shift.findOne({
            employeeId: this._id,
            clockInTime: {
                $gt: this.shiftStartToday,
                $lt: this.shiftEndToday,
            },
            clockOutTime: { $exists: false }
        });
    
    return this.shift;
};

employee.methods.hasClockedInToday = async function () {
    const shift = await this.getShift();
    return Boolean(shift);
};

employee.methods.hasClockedOutToday = async function () {
    const shift = await this.getShift();
    return Boolean(shift.clockOutTime);
};

employee.methods.hasClockedOutYesterday = async function (fetchType) {
    const now = new Date();
    const startOfPreviousDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - 1
    );

    const endOfPreviousDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    // const shiftYesterday = await Shift.findOne({
    //     employeeId: this._id,
    //     clockInTime: {
    //         $gt: startOfPreviousDay,
    //         $lt: endOfPreviousDay,
    //     },
    // });
    // console.log("Yesterday shift",shiftYesterday)
    
    // if (fetchType==="getshift") {
    //     return (shiftYesterday);
    // } else {
    //     return Boolean(shiftYesterday.clockOutTime);
    // }
};

employee.methods.getRelativeTime = function (fromObject = {}) {
    return DateTime.fromObject(fromObject, { zone: this.timezone });
};

const isUndefined = a => typeof a === 'undefined';

export default model('employee', employee);
