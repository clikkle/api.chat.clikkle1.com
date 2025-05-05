
// import { Types } from 'mongoose';
// import DataSource from '../../../classes/DataSource.js';
// import Docs from '../../../schema/Docs.js';

// export default async function (req, res, next) {
//     try {
//         const docsId = req.params.id;
//         const adminId = req.orgId ;
        
//         if (docsId) {
//             const [doc] = await Docs.aggregate([
//                 {
//                     $match: {
//                         _id: new Types.ObjectId(docsId),
//                     },
//                 },
//                 {
//                     $lookup: {
//                         from: 'joblistings',
//                         localField: 'jobIds',
//                         foreignField: '_id',
//                         as: 'joblistings',
//                         pipeline: [
//                             {
//                                 $project: {
//                                     _id: 1,
//                                     title: 1,
//                                 },
//                             },
//                         ],
//                     },
//                 },
//             ]);

//             return res.success({ doc });
//         }

//         const jobId = req.query.jobId;

//         const dataSource = new DataSource(Docs, req.query);
//         const query = {
//             $expr: {
//                 $in: [new Types.ObjectId(jobId), '$jobIds'],
//             },
//         };

//         const docs = await dataSource.aggregate([
//             {
//                 $match: {
//                     ...(jobId ? query : {}),
//                     adminId: new Types.ObjectId(adminId),
//                 },
//             },
//             {
//                 $lookup: {
//                     from: 'joblistings',
//                     localField: 'jobIds',
//                     foreignField: '_id',
//                     as: 'joblistings',
//                     pipeline: [
//                         {
//                             $project: {
//                                 _id: 1,
//                                 title: 1,
//                             },
//                         },
//                     ],
//                 },
//             },
//         ]);

//         res.success({
//             docs,
//             pageDate: dataSource.pageData,
//         });
//     } catch (err) {
//         next(err);
//     }
// }
import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import Docs from '../../../schema/Docs.js';

export default async function (req, res, next) {
    try {
        const docsId = req.params.id;
        const adminId = req.orgId;

        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1;   // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
        const skip = (page - 1) * limit;
        req.query.pageSize = limit;
        if (docsId) {
            const [doc] = await Docs.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(docsId),
                    },
                },
                {
                    $lookup: {
                        from: 'joblistings',
                        localField: 'jobIds',
                        foreignField: '_id',
                        as: 'joblistings',
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    title: 1,
                                },
                            },
                        ],
                    },
                },
            ]);

            return res.success({ doc });
        }

        const jobId = req.query.jobId;

        const dataSource = new DataSource(Docs, req.query);
        const query = {
            $expr: {
                $in: [new Types.ObjectId(jobId), '$jobIds'],
            },
        };

        // Fetch total count for pagination
        const totalDocs = await Docs.countDocuments({
            ...(jobId ? query : {}),
            adminId: new Types.ObjectId(adminId),
        });

        // Add pagination to the aggregate pipeline
        const docs = await dataSource.aggregate([
            {
                $match: {
                    ...(jobId ? query : {}),
                    adminId: new Types.ObjectId(adminId),
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: 'joblistings',
                    localField: 'jobIds',
                    foreignField: '_id',
                    as: 'joblistings',
                    pipeline: [
                        {
                            $project: {
                                _id: 1,
                                title: 1,
                            },
                        },
                    ],
                },
            },
            // { $skip: skip }, // Skip documents based on the page number
            // { $limit: limit }, // Limit documents to the defined number
        ]);

        res.success({
            docs,
            pageData: {
                currentPage: page,
                totalPages: Math.ceil(totalDocs / limit),
                totalDocs,
            },
        });
    } catch (err) {
        next(err);
    }
}

