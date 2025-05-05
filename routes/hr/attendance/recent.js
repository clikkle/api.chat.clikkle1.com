import Shift from "../../../schema/Shift.js";
import { Types } from 'mongoose';

export default async function (req, res, next) {
    try {
        const orgId = req?.orgId || null ;

        // Convert orgId to ObjectId
        if(!orgId || orgId == null ){
            throw new Error('Admin ID must be provided');
        }
        const orgObjectId = new Types.ObjectId(orgId);

        const currentDate = new Date();
         const year = currentDate.getFullYear();
        // const month = currentDate.getMonth() + 1;
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const regexPattern = new RegExp(`^${year}-${month}`);
        const attendance = await Shift.aggregate([
            {
                $match: {
                    // 'clockInDate.year': Number(year),
                    // 'clockInDate.month': Number(month),
                    $expr: {
                        $and: [
                            { $eq: [{ $year: "$clockInTime" }, year] },
                            { $eq: [{ $month: "$clockInTime" }, parseInt(month)] }
                        ]
                    },
                    // $expr: {
                    //     $lte: ['$clockInTime', new Date()],
                    // },
                    adminId: orgObjectId,
                },
            },
            { $sort: { _id: -1 } },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'employeeId',
                    foreignField: '_id',
                    as: 'employeeData',
                    pipeline: [
                        {
                            $match: {
                                //adminId: orgObjectId,
                                status:"Active"
                            },
                        },
                        {
                            $project: {
                                firstName: 1,
                                lastName: 1,
                                role:1,
                                shiftStart: 1,
                                shiftEnd: 1
                            },
                        },
                    ],
                },
            },
            {
                $unwind: {
                    path: '$employeeData',
                },
            },
        ]);   

        res.success({ attendance });
    } catch (err) {
        next(err);
    }
}
