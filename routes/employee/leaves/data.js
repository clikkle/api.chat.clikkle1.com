import Employee from '../../../schema/Employee.js';
import Leave from '../../../schema/Leave.js';
import LeaveType from '../../../schema/LeaveType.js';

export default async function (req, res, next) {
     // const employeeId = req.user.id;
     const employeeId = req.query.empId;

    try {
        const [leavesAllowed] = await LeaveType.aggregate([
            { $group: { _id: null, leaves: { $sum: '$noOfLeaves' } } },
        ]);

        const currentYear = new Date().getFullYear();
        const leaves = await Leave.aggregate([
            {
                $match: {
                    employeeId,
                    'dates.0.year': currentYear,
                    status: 'Approved',
                },
            },
            {
                $group: {
                    _id: '$leaveType',
                    count: {
                        $sum: {
                            $size: '$dates',
                        },
                    },
                },
            },
        ]);

        const leavesMetrics = {};

        leaves.forEach(doc => {
            leavesMetrics[doc._id] = doc.count;
        });

        const totalLeaves = leaves.reduce(
            (totalLeaves, leaves) => totalLeaves + leaves.count,
            0
        );

        leavesMetrics['Remaining Leaves'] = leavesAllowed - totalLeaves;

        res.success({ leavesMetrics });
    } catch (err) {
        next(err);
    }
}
