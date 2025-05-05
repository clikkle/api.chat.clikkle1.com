import LeaveType from '../../../schema/LeaveType.js';
import { Types } from 'mongoose';
export default async function (req, res, next) {
    // console.log("req.user",req.user);
    // console.log("req.orgId",req.orgId);
    try {
        // let adminId = new Types.ObjectId(req.query.orgId);

        // if (req.user.role==="employee") {
        //     adminId = new Types.ObjectId(req.user.orgId);
        // } else {
        //     adminId = new Types.ObjectId(req.orgId);  
        // }
        const leaveTypes = await LeaveType.find({adminId:req.query.orgId});

        res.success({
            leaveTypes,
        });
    } catch (err) {
        next(err);
    }
}
