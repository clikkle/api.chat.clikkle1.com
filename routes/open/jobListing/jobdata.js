import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import JobListing from '../../../schema/JobListing.js';

export default async function (req, res, next) {
    try {
        const id = req.params.id;
        const adminId = req.query.adminId; // Fetching adminId from query parameters
        req.query.pageSize = "all";
        if (id) {
            const [job] = await JobListing.aggregate([
                { $match: { _id: new Types.ObjectId(id), adminId: new Types.ObjectId(adminId) } }, // Match adminId here
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

        // If no id provided, fetch all jobs matching adminId
        const matchStage = {};

        if (adminId) {
            matchStage.adminId = new Types.ObjectId(adminId); // Match adminId if available
        } else {
            // If adminId is not provided, return an error
            return res.status(400).json({ message: 'adminId must be provided' });
        }

        const dataSource = new DataSource(JobListing, req.query);
        const jobs = await dataSource.aggregate([
            { $match: matchStage }, // Apply matchStage to filter by adminId
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
