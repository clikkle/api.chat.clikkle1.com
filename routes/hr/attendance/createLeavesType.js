import LeaveType from '../../../schema/LeaveType.js';

export default async function (req, res, next) {
    try {
        const { name, noOfLeaves } = req.body;
        const orgId = req.orgId ;
     
        const leaveType = new LeaveType({
            name,
            noOfLeaves,
            adminId:orgId
        });
        await leaveType.save();

        res.success('LeaveType created successfully');
    } catch (err) {
        next(err);
    }
}
