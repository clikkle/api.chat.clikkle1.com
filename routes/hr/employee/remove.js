import Employee from '../../../schema/Employee.js';
import { Types } from 'mongoose';
import mongoose, { connect, disconnect } from 'mongoose';

import JobApplication from '../../../schema/JobApplication.js';
import OfferLetter from '../../../schema/OfferLetter.js';
import Subscription from '../../../schema/Subscription.js';
import Leaves from '../../../schema/Leave.js';
import Shift from '../../../schema/Shift.js';
import Award from '../../../schema/Award.js';
import Message from '../../../schema/Message.js';
import fs from 'fs';


export default async function (req, res, next) {
    try {
        const { employeeId } = req.params;
        // const { reason } = req.body;

        if (!employeeId) Error.throw('Field `Employee Id` is required ');
        // if (!reason?.trim()) Error.throw('Field `reason` is required ');
        const uriDB2=process.env.MONGODB_ACCOUNT_CONNECTION;
        const db2Connection = mongoose.createConnection(uriDB2, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const UserSchema = new mongoose.Schema({
            _id: mongoose.Schema.Types.ObjectId,
        });

        const employee = await Employee.findById(employeeId);
        const jobApplication = await JobApplication.findOne({ userId: employeeId, jobId:employee.designation });
        // const designation = await JobListing.findById(employee.designation);
        // console.log("jobApplication",jobApplication);
        // if (!employee) Error.throw('No employee found to terminate', 404);

        // await jobApplication.save();

        const User = db2Connection.model('User', UserSchema);

        const userId = new Types.ObjectId(employeeId);
        let returnResponse = {};
        if (jobApplication) {
            
            try {
                fs.unlinkSync(`./uploads/${jobApplication.resume}`);
            } catch (errresume) {
                console.error('Error deleting resume file:', errresume);
            }
            try {
                fs.unlinkSync(`./uploads/${jobApplication.photo}`);
            } catch (errphoto) {
                console.error('Error deleting photo file:', errphoto);
            }
            
            const jobApplicationDeleteResult = await JobApplication.deleteOne({ userId: employeeId, jobId:employee.designation });
            returnResponse = {...returnResponse, jobApplicationDelete : jobApplicationDeleteResult.deletedCount > 0};
        }
        // if (User.findOne({ _id: userId })) {
        //     const userDeleteResult = await User.deleteOne({ _id: userId });
        //     returnResponse = {...returnResponse, userDelete : userDeleteResult.deletedCount > 0};
        // }
        if (OfferLetter.findOne({ userId: userId })) {
            const OfferLetterDeleteResult = await OfferLetter.deleteMany({ userId: userId });
            returnResponse = {...returnResponse, OfferLetterDelete : OfferLetterDeleteResult.deletedCount > 0};
        }
        if (Subscription.findOne({ userId: userId })) {
            const SubscriptionDeleteResult = await Subscription.deleteMany({ userId: userId });
            returnResponse = {...returnResponse, SubscriptionDelete : SubscriptionDeleteResult.deletedCount > 0};
        }
        if (Leaves.findOne({ employeeId: userId })) {
            const LeavesDeleteResult = await Leaves.deleteMany({ employeeId: userId });
            returnResponse = {...returnResponse, LeavesDelete : LeavesDeleteResult.deletedCount > 0};
        }
        if (Shift.findOne({ employeeId: userId })) {
            const ShiftDeleteResult = await Shift.deleteMany({ employeeId: userId });
            returnResponse = {...returnResponse, ShiftDelete : ShiftDeleteResult.deletedCount > 0};
        }
        if (Award.findOne({ employeeId: userId })) {
            const AwardDeleteResult = await Award.deleteMany({ employeeId: userId });
            returnResponse = {...returnResponse, AwardDelete : AwardDeleteResult.deletedCount > 0};
        }
        if (Message.findOne({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
          })) {
            const MessageDeleteResult = await Message.deleteMany({
                $or: [
                  { sender: userId },
                  { receiver: userId }
                ]
              });
            returnResponse = {...returnResponse, MessageDelete : MessageDeleteResult.deletedCount > 0};
        }
        
        if (employee) {
            const employeeDeleteResult = await Employee.deleteOne({ _id: userId });
            returnResponse = {...returnResponse, employeeDelete : employeeDeleteResult.deletedCount > 0};
        }
        
        res.success(returnResponse);
    } catch (err) {
        next(err);
    }
}
