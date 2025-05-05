import Shift from '../../../schema/Shift.js';
import Employee from '../../../schema/Employee.js';
import { parseIp } from '../../../utils/functions.js';
import { Types } from 'mongoose';
export default async function (req, res, next) {
    // const employeeId = req.user.id;
    const employeeId = new Types.ObjectId(req.query.empId);


    try {
        const ip = parseIp(req);
        const employee = await Employee.findById(employeeId);

        if (!employee.isInWorkingHours())
            Error.throw('You are not in your working hours, you cannot clock-in now');

        if (await employee.hasClockedInToday()) Error.throw('You are already clocked in today');

        const now = employee.getRelativeTime();

        let status = 'Present';
        if (employee.shiftStartToday.plus({ minutes: 5 }) < now) {
            status = 'Late';
        }

        const shift = new Shift({
            adminId : employee.adminId,
            employeeId,
            ip,
            clockInTime: now,
            clockInDate: {
                year: now.year,
                month: now.month,
                day: now.day,
            },
            status,
        });
   

        await shift.save();

        res.success(`You are now clocked-in as ${status}`);
    } catch (err) {
        next(err);
    }
}
