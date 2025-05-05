import { DateTime } from 'luxon';
import Leave from '../../../schema/Leave.js';
import Shift from '../../../schema/Shift.js';
import { workingDays } from '../../../utils/functions.js';

export default function (action) {
    return async function (req, res, next) {
        try {
            const leaveId = req.params.leaveId;
            const leave = await Leave.findOne({
                _id: leaveId,
                status: 'Pending',
            });

            if (!leave) Error.throw('No leaves found for leaveId ' + leaveId);

            const wDays = workingDays(leave.dates);

            if (action === 'Approved') {
                const documents = wDays.map(day => {
                    const date = DateTime.fromISO(day);

                    return {
                        clockInDate: { year: date.year, month: date.month, day: date.day },
                        employeeId: leave.employeeId,
                        status: 'Leave',
                    };
                });

                await Shift.insertMany(documents);
            }

            leave.status = action;
            await leave.save();

            res.success(`Leave ${action} successfully`);

            if (action === 'Approved') {
                await pushNotification({
                    employeeId: leave.employeeId,
                    title: 'Leave Approved',
                    description: `Your ${wDays.length} day(s) leave has been approved, congrats 🎉`,
                });
            }
        } catch (err) {
            next(err);
        }
    };
}

async function pushNotification(data) {
    const notification = new Notification(data);
    return notification.save();
}
