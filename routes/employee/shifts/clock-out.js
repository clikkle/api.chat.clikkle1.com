import Employee from '../../../schema/Employee.js';
import { Types } from 'mongoose';

export default async function (req, res, next) {
    try {
        // const employeeId = req.user.id;
        const employeeId = new Types.ObjectId(req.query.empId);

        const note = req.body.note;

        if (!note) Error.throw('You must provide a note', 400);

        const employee = await Employee.findById(employeeId);

        if (!(await employee.hasClockedInToday()))
            Error.throw('You must be clocked in before clocking out');

        if (await employee.hasClockedOutToday())
            Error.throw('You have already clocked out today');

        const now = employee.getRelativeTime();
        const shift = await employee.getShift();

        const status = await shift.updateOne({
            $set: {
                clockOutTime: new Date(),
                clockOutDate: {
                    year: now.year,
                    month: now.month,
                    day: now.day,
                },
                note,
            },
        });

        if (status.modifiedCount === 0)
            Error.throw(
                'Error Clocking out, please try again later code: (x225)'
            );

        res.success('Clocked out successfully');
    } catch (err) {
        next(err);
    }
}
