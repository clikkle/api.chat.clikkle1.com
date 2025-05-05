import { DateTime } from 'luxon';
import Shift from '../../../schema/Shift.js';
import Employee from '../../../schema/Employee.js';
import { Types } from 'mongoose';

export default async function (req, res, next) {
    try {
        // const employeeId = req.user.id;
        const employeeId = new Types.ObjectId(req.query.empId);

        const employee = await Employee.findById(employeeId);

        const now = employee.getRelativeTime();

        const monthStart = getMaxDate(
            now.startOf('month'),
            DateTime.fromJSDate(employee.dateOfJoining)
        );

        const monthEnd = now;

        const data = await Shift.aggregate([
            {
                $match: {
                    clockInTime: {
                        $gte: monthStart,
                        $lte: monthEnd,
                    },
                    employeeId,
                },
            },
            {
                $facet: {
                    attendance: [
                        {
                            $group: {
                                _id: '$clockInDate.day',
                                shift: {
                                    $push: '$$ROOT',
                                },
                            },
                        },
                        {
                            $project: {
                                day: '$_id',
                                shift: 1,
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    dates: {
                        $map: {
                            input: {
                                $range: [monthStart.day, now.day],
                            },
                            as: 'currentDate',
                            in: {
                                day: '$$currentDate',
                                shift: [],
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    data: {
                        $concatArrays: ['$attendance', '$dates'],
                    },
                },
            },
            {
                $unwind: {
                    path: '$data',
                },
            },
            {
                $group: {
                    _id: '$data.day',
                    shift: {
                        $first: '$data.shift',
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    day: '$_id',
                    shift: {
                        $ifNull: [
                            {
                                $first: '$shift',
                            },
                            {
                                status: 'Absent',
                            },
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: '$shift.status',
                    count: {
                        $count: {},
                    },
                },
            },
        ]);

        let startDate = monthStart;
        const endDate = monthEnd;

        let holidayCount = 0;

        while (startDate <= endDate) {
            if ([7, 6].includes(startDate.weekday)) {
                holidayCount++;
            }
            startDate = startDate.plus({ days: 1 });
        }

        const monthData = {};

        data.forEach(doc => {
            monthData[doc._id] = doc.count;
        });

        monthData.Holiday = (monthData.Holiday || 0) + holidayCount;
        monthData.Absent = monthData.Absent - holidayCount;

        res.success({
            isClockedIn: await employee.hasClockedInToday(),
            isClockedOutYesterday: await employee.hasClockedOutYesterday(),
            monthData,
        });
    } catch (err) {
        next(err);
    }
}

function getMaxDate(d1, d2) {
    if (d1 > d2) return d1;
    else return d2;
}
