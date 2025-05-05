import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import Award from '../../../schema/Award.js';

export default async function (req, res, next) {
    try {
        const id = req.params.id;
      const adminId = req.orgId ;

        if (id) {
            const [award] = await Award.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(id),
                    },
                },
                {
                    $lookup: {
                        from: 'employees',
                        localField: 'employeeId',
                        foreignField: '_id',
                        as: 'employee',
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'joblistings',
                                    localField: 'designation',
                                    foreignField: '_id',
                                    as: 'designation',
                                },
                            },
                            {
                                $project: {
                                    firstName: 1,
                                    lastName: 1,
                                    email: 1,
                                    designation: {
                                        $arrayElemAt: ['$designation.title', 0],
                                    },
                                    _id: 0,
                                },
                            },
                        ],
                    },
                },
                {
                    $addFields: {
                        employee: { $arrayElemAt: ['$employee', 0] },
                    },
                },
            ]);
            if (!award) {
                return res.status(404).json({ message: 'Award not found for the provided adminId.' });
            }
            return res.success({ award });
        }

        const dataSource = new DataSource(Award, req.query);
        const pipeline = [
            {
                $match: {
                    adminId: new Types.ObjectId(adminId), // Filter by adminId
                },
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'employeeId',
                    foreignField: '_id',
                    as: 'employee',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'joblistings',
                                localField: 'designation',
                                foreignField: '_id',
                                as: 'designation',
                            },
                        },
                        {
                            $project: {
                                firstName: 1,
                                lastName: 1,
                                email: 1,
                                designation: {
                                    $arrayElemAt: ['$designation.title', 0],
                                },
                                _id: 0,
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    employee: { $arrayElemAt: ['$employee', 0] },
                },
            },
        ];

        const awards = await dataSource.aggregate(pipeline);

        res.success({
            awards,
            pageData: dataSource.pageData,
        });
    } catch (err) {
        next(err);
    }
}
