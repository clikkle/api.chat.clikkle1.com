import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import JobListing from '../../../schema/JobListing.js';

export default async function (req, res, next) {
    try {
        const id = req.params.id;

        if (id) {
            const [job] = await JobListing.aggregate([
                { $match: { _id: new Types.ObjectId(id) } },
                {
                    $lookup: {
                        from: 'departments',
                        localField: 'department',
                        foreignField: '_id',
                        as: 'department',
                        pipeline: [
                            {
                                $project: {
                                    name: 1,
                                    _id: 0,
                                },
                            },
                        ],
                    },
                },
                {
                    $addFields: {
                        department: { $arrayElemAt: ['$department.name', 0] },
                    },
                },
            ]);

            return res.success({ job });
        }

        const dataSource = new DataSource(JobListing, req.query);
        const jobs = await dataSource.aggregate([
            {
                $lookup: {
                    from: 'departments',
                    localField: 'department',
                    foreignField: '_id',
                    as: 'department',
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                _id: 0,
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    department: { $arrayElemAt: ['$department.name', 0] },
                },
            },
        ]);

        res.success({
            jobs,
            pageData: dataSource.pageData,
        });
    } catch (e) {
        next(e);
    }
}
