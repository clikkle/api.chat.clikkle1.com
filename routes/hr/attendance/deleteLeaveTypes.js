import Leave from '../../../schema/Leave.js';
import LeaveType from '../../../schema/LeaveType.js';

export default async function (req, res, next) {
    try {
        const leaveTypeId = req.params.id;

        if (!leaveTypeId) Error.throw('LeaveType ID is required');

        await Leave.deleteMany({ leaveType: leaveTypeId });

        await LeaveType.findByIdAndDelete(leaveTypeId);

        res.success('LeaveType deleted successfully');
    } catch (err) {
        next(err);
    }
}
