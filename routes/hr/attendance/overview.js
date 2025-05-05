import DataSource from '../../../classes/DataSource.js';
import Shift from '../../../schema/Shift.js';
import { Types } from 'mongoose';
export default async function (req, res, next) {
    try {
        // Retrieve orgId from the authenticated user's session or token
        const orgId = req.orgId;
      
        // Extract month and year from query parameters
        const { month, year } = req.query;

        // Validate month and year
        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required' });
        }

        // Fetch attendance data filtered by month, year, and adminId
        // const attendance = await Shift.aggregate([
        //     {
        //         $match: {
        //             'clockInDate.year': Number(year),
        //             'clockInDate.month': Number(month),
        //             adminId:  new Types.ObjectId(orgId) , // Filter by adminId
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: 'employees',
        //             localField: 'employeeId',
        //             foreignField: '_id',
        //             as: 'employeeData',
        //             pipeline: [
        //                 {
        //                     $project: {
        //                         firstName: 1,
        //                         lastName: 1,
        //                     },
        //                 },
        //             ],
        //         },
        //     },
        //     {
        //         $group: {
        //             _id: '$clockInDate.day',
        //             attendance: {
        //                 $push: {
        //                     employee: {
        //                         id: '$employeeId',
        //                         name: {
        //                             $concat: [
        //                                 {
        //                                     $arrayElemAt: ['$employeeData.firstName', 0],
        //                                 },
        //                                 ' ',
        //                                 {
        //                                     $arrayElemAt: ['$employeeData.lastName', 0],
        //                                 },
        //                             ],
        //                         },
        //                     },
        //                     status: '$status',
        //                     clockInTime: '$clockInTime',
        //                     clockOutTime: '$clockOutTime',
        //                     note: '$note',
        //                 },
        //             },
        //         },
        //     },
        //     {
        //         $project: {
        //             _id: 0,
        //             day: '$_id',
        //             attendance: 1,
        //         },
        //     },
        // ]);
        const attendance = await Shift.aggregate([
            {
                $match: {
                    'clockInDate.year': Number(year),
                    'clockInDate.month': Number(month),
                    adminId:  new Types.ObjectId(orgId) , // Filter by adminId
                },
            },


            {
              // Group by employeeId and count the occurrences of each status
              $group: {
                _id: "$employeeId",
                presentCount: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "Present"] }, 1, 0]
                  }
                },
                lateCount: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "Late"] }, 1, 0]
                  }
                },
                halfDayCount: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "Half-Day"] }, 1, 0]
                  }
                },
                leaveCount: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "Leave"] }, 1, 0]
                  }
                }
              }
            },
            {
              // Perform the lookup to join the employee details
              $lookup: {
                from: 'employees',
                localField: '_id',
                foreignField: '_id',
                as: 'employeeData',
                pipeline: [
                  {
                    $project: {
                      firstName: 1,
                      lastName: 1,
                    },
                  },
                ],
              },
            },
            {
              $unwind: "$employeeData"
            }
          ]);
          

        // Send the response
        res.success({
            attendance,
        });
    } catch (err) {
        next(err);
    }
}
