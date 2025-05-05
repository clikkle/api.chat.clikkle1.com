import DataSource from '../../../classes/DataSource.js';
import Holiday from '../../../schema/Holiday.js';
import { Types } from 'mongoose';

export default async function (req, res, next) {
    try {
        const id = req.params.id;
        const orgId = req.orgId; // Assuming orgId is a string representation of ObjectId
       

        // Extract adminId from request query or context
        const adminId = req.query.adminId || orgId;

        if (id) {
            const holiday = await Holiday.findOne({ _id: id, adminId: new Types.ObjectId(adminId) });

            if (!holiday) {
                return res.status(404).json({ message: 'Holiday not found for the provided adminId.' });
            }

            return res.json({ holiday });
        }

        const dataSource = new DataSource(Holiday, req.query);
        let filter = {};

        if (adminId) {
            filter = { ...filter, adminId: new Types.ObjectId(adminId) };
        }

        const holidays = await dataSource.find(filter);

        res.json({
            holidays,
            pageData: dataSource.pageData,
        });
    } catch (err) {
        next(err);
    }
}
