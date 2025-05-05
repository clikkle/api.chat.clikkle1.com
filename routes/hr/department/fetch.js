import DataSource from '../../../classes/DataSource.js';
import Department from '../../../schema/Department.js';
import { getCache } from '../../../libs/cacheStore.js';

export default async function (req, res, next) {
    try {
        const orgId = req.orgId ; 

        const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
        const pageSize = parseInt(req.query.pageSize) || 20; // Default page size

        // Calculate skip based on pagination
        const skip = (page - 1) * pageSize;

        // Query departments matching adminId and calculate total count
        const departmentsPromise = Department.find({ adminId: orgId }).lean();
        const countPromise = Department.countDocuments({ adminId: orgId });

        const [departments, totalData] = await Promise.all([departmentsPromise.skip(skip).limit(pageSize).exec(), countPromise]);

        const totalPages = Math.ceil(totalData / pageSize);

        res.success({
            departments,
            pageData: {
                totalPages,
                totalData,
                currentPage: page,
                pageSize,
            },
        });
    } catch (err) {
        next(err);
    }
}
