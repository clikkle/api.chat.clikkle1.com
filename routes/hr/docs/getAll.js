import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import Docs from '../../../schema/Docs.js';

export default async function (req, res, next) {
    try {
        const { adminId } = req.params;

        if (!adminId) throw new Error('Admin ID must be provided');

        // Pagination setup
        const page = parseInt(req.query.page) || 1;   // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
        const skip = (page - 1) * limit;

        // Add filter for adminId
        req.query.adminId = new Types.ObjectId(adminId);

        const dataSource = new DataSource(Docs, req.query);
        const docs = await dataSource.find({})
            .skip(skip)
            .limit(limit);

        // Get total count of documents
        const totalDocs = await Docs.countDocuments({ adminId: new Types.ObjectId(adminId) });
        const totalPages = Math.ceil(totalDocs / limit);

        res.success({
            docs,
            pageData: {
                totalPages,
                totalData: totalDocs,
                currentPage: page,
                pageSize: docs.length,
            },
        });
    } catch (e) {
        next(e);
    }
}
