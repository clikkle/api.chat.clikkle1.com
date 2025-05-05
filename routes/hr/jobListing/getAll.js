// import { Types } from 'mongoose';
// import DataSource from '../../../classes/DataSource.js';
// import JobListing from '../../../schema/JobListing.js';

// export default async function (req, res, next) {
//     try {
//         const { adminId } = req.params;

//         if (!adminId) Error.throw('Admin ID must be provided');

//         const department = req.query.department;

//         if (department) {
//             req.query.department = new Types.ObjectId(department);
//         }

//         // Add filter for adminId
//         req.query.adminId = new Types.ObjectId(adminId);

//         const dataSource = new DataSource(JobListing, req.query, ['department']);
//         const jobs = await dataSource.find({});

//         res.success({
//             jobs,
//             pageData: dataSource.pageData,
//         });
//     } catch (e) {
//         next(e);
//     }
// }
import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import JobListing from '../../../schema/JobListing.js';

export default async function (req, res, next) {
    try {
        const { adminId } = req.params;

        if (!adminId) throw new Error('Admin ID must be provided');

        const department = req.query.department;

        if (department) {
            req.query.department = new Types.ObjectId(department);
        }

        // Pagination setup
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Add filter for adminId
        req.query.adminId = new Types.ObjectId(adminId);

        const dataSource = new DataSource(JobListing, req.query, ['department']);
        const jobs = await dataSource.find({})
            .skip(skip)
            .limit(limit);

        // Get total count of jobs
        const totalJobs = await JobListing.countDocuments({ adminId: new Types.ObjectId(adminId) });
        const totalPages = Math.ceil(totalJobs / limit);

        res.success({
            jobs,
            pageData: {
                // dataSource: pageData,
                totalPages: totalPages,
                totalData: totalJobs,
                currentPage: page,
                pageSize: jobs.length,
            },
        });
    } catch (e) {
        next(e);
    }
}

