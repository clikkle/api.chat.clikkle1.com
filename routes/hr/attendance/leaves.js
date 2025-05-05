import DataSource from '../../../classes/DataSource.js';
import Leave from '../../../schema/Leave.js';
import { Types } from 'mongoose';

export default async function (req, res, next) {
    try {
        const adminId = new Types.ObjectId(req.orgId);
        const dataSource = new DataSource(Leave, req.query);
        const leaves = await dataSource.aggregate([
            // {
            //     $match: {
            //         status: 'Pending',
            //     },
            // },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'employeeId',
                    foreignField: '_id',
                    as: 'empData',
                },
            },
            {
                $match: {
                  "empData.adminId": adminId    // Filter by adminID in the joined `employees` documents
                }
            },
            {
                $addFields: {
                    empData: {
                        $arrayElemAt: ['$empData', 0],
                    },
                },
            },
            {
                $addFields: {
                    fullName: {
                        $concat: [
                            '$empData.firstName',
                            ' ',
                            '$empData.lastName',
                        ],
                    },
                    department: '$empData.department',
                },
            },
            {
                $project: {
                    empData: 0,
                },
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'department',
                    foreignField: '_id',
                    as: 'department',
                },
            },
            {
                $addFields: {
                    department: {
                        $getField: {
                            field: 'name',
                            input: {
                                $arrayElemAt: ['$department', 0],
                            },
                        },
                    },
                },
            },
        ]);

        res.success({ leaves, pageData: dataSource.pageData });
    } catch (err) {
        next(err);
    }
}
