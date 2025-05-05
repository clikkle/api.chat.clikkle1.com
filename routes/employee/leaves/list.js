import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import Leave from '../../../schema/Leave.js';

export default async function (req, res, next) {
    // const employeeId = req.user.id;
    const employeeId = req.params.id;

    try {
        const dataSource = new DataSource(Leave, req.query);
        const leaves = await dataSource.aggregate([
            {
                $match: {
                    employeeId: new Types.ObjectId(employeeId),
                },
            },
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

       
        res.success({ leaves, pageData: dataSource.pageData });
    } catch (err) {
        next(err);
    }
}
