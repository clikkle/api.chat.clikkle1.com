import LeaveType from '../../../schema/LeaveType.js';

export default async function (req, res, next) {
    try {
        const leaveTypeId = req.params.id;

        const { name, noOfLeaves } = req.body;

        const status = await LeaveType.findByIdAndUpdate(leaveTypeId, {
            name,
            noOfLeaves,
        });

        if (!status.isModified) {
            Error.throw("Something went wrong, couldn't update", 500);
        }

        res.success('LeaveType updated successfully');
    } catch (err) {
        next(err);
    }
}
