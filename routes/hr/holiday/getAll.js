import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import Holiday from '../../../schema/Holiday.js';

export default async function (req, res, next) {
    try {
        const { adminId } = req.query; 
        
        if (!adminId) {
            throw new Error('Admin ID must be provided');
        }

        if (!Types.ObjectId.isValid(adminId)) {
            throw new Error('Invalid Admin ID');
        }

        const adminObjectId = new Types.ObjectId(adminId);

        const query = { adminId: adminObjectId };

        const dataSource = new DataSource(Holiday, req.query);

        const holidays = await dataSource.find(query);

        res.success({
            holidays,
            pageDate: dataSource.pageData,
        });
    } catch (err) {
        console.error("Error:", err);
        next(err);
    }
}
