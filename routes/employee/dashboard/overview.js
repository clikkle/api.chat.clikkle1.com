import { Types } from 'mongoose';
import Employee from '../../../schema/Employee.js';
import Leave from '../../../schema/Leave.js';
import Notice from '../../../schema/Notice.js';
import Project from '../../../schema/Project.js';
import Shift from '../../../schema/Shift.js';
import Holiday from '../../../schema/Holiday.js';
import { DateTime } from 'luxon';
import Award from '../../../schema/Award.js';
import moment from "moment";

export default async function (req, res, next) {
    const employeeId = req.query.empId;

    try {
        const date = DateTime.now();

        const totalAttendance = await Shift.count({
            employeeId,
            status: {
                $in: ['Present', 'Late'],
            },
        });

        const absents = await Shift.count({
            employeeId,
            status: 'Absent',
        });

        const awards = await Award.count({ employeeId });

        const completedProjects = await Project.count({
            employeeId,
            status: 'Completed',
        });

        const employee = await Employee.findById(employeeId);

        const notices = await Notice.aggregate([
            {
                $match: {
                    status: 'active',
                    $expr: { $in: [employee.department, '$departmentIds'] },
                },
            },
            { $limit: 9 },
            {
                $addFields: {
                    caption: { $substr: ['$content', 0, 50] },
                },
            },
            {
                $project: {
                    content: 0,
                    departmentIds: 0,
                },
            },
            { $sort: { createdAt: -1 } },
        ]);

        const attendance = await Shift.aggregate([
            {
                $match: {
                    employeeId: new Types.ObjectId(employeeId),
                    status: {
                        $in: ['Present', 'Late'],
                    },
                },
            },
            {
                $group: {
                    _id: '$clockInDate.month',
                    attendance: { $sum: 1 },
                },
            },
        ]);

        const projects = await Project.aggregate([
            {
                $match: {
                    status: 'Completed',
                    employeeId: new Types.ObjectId(employeeId),
                },
            },

            {
                $addFields: {
                    month: {
                        $month: '$endDate',
                    },
                },
            },
            {
                $group: {
                    _id: '$month',
                    project: {
                        $sum: 1,
                    },
                },
            },
        ]);

        const holidays = await Holiday.aggregate([
            {
                $match: {
                    $expr: { $gte: ['$date', date.startOf('day')] },
                },
            },

            { $limit: 7 },
        ]);

        const leaves = await Leave.aggregate([
            {
                $match: {
                    employeeId: new Types.ObjectId(employeeId),
                },
            },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'leavetypes',
                    localField: 'leaveType',
                    foreignField: '_id',
                    as: 'leaves',
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    leave: { $arrayElemAt: ['$leaves.name', 0] },
                },
            },
            {
                $project: {
                    leaves: 0,
                },
            },
        ]);

         const employeesDepartment = await Employee.aggregate([
                    {
                        $match: {
                            adminId: employee?.adminId,
                            department:employee?.department,
                            status: 'Active',
                        },
                    },
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            role: 1,
                        },
                    },
                ]);


            const startOfWeek = moment().startOf('week');
const endOfWeek = moment().endOf('week');
const today = moment().startOf('day'); // to compare with current date

console.log("Start of week:", startOfWeek.format());
console.log("End of week:", endOfWeek.format());

// Fetch all shifts for the employee within the current week
const shifts = await Shift.find({
  employeeId: new Types.ObjectId(employeeId),
  clockInTime: {
    $gte: startOfWeek.toDate(),
    $lte: endOfWeek.toDate()
  }
});

const weekAttendanceData = [];

for (let i = 0; i < 7; i++) {
  const currentDay = startOfWeek.clone().add(i, 'days');
  const formattedDate = currentDay.format("YYYY-MM-DD");
  const isWeekend = i === 0 || i === 6;

  let status = "";

  if (isWeekend) {
    status = "Weekend";
  } else if (currentDay.isSame(today, 'day')) {
    // Skip checking for today, let it be empty or show "Pending"
    status = "Pending"; 
  } else {
    const shift = shifts.find(s =>
      moment(s.clockInTime).isSame(currentDay, 'day')
    );
    if (shift) {
      status = shift.status || "Present";
    } else if (currentDay.isBefore(today)) {
      status = "Absent";
    } else {
      status = "Pending"; // future day (e.g., later this week)
    }
  }

  weekAttendanceData.push({ date: formattedDate, status });
}


                
        res.success({
            weekAttendanceData,
            employeesDepartment,
            totalAttendance,
            completedProjects,
            absents,
            notices,
            leaves,
            attendance,
            projects,
            holidays,
            awards,
        });
    } catch (err) {
        next(err);
    }
}
