import Leave from '../../../schema/Leave.js';
import { workingDays } from '../../../utils/functions.js';

export default async function (req, res, next) {
    // const employeeId = req.user.id;
     const employeeId = req.query.empId;
    const { dates, leaveType, reason } = req.body;

    try {
        const year = dates[0].year;

        if (!dates.every(date => date.year == year))
            Error.throw('All Dates must be in the same year');

        const wDays = workingDays(dates);

        if (!wDays.length)
            Error.throw(
                'Chosen day is a holiday. Please select an alternative date for your leave application'
            );

        const leave = new Leave({
            dates,
            leaveType,
            reason,
            employeeId,
        });

        await leave.save();

        res.success('Leave applied successfully');
    } catch (err) {
        next(err);
    }
}
