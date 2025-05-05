import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import Employee from '../../../schema/Employee.js';

export default async function (req, res, next) {
    try {
        const { adminId } = req.query; // Assuming adminId is provided as a query parameter

        if (!adminId) {
            throw new Error('Admin ID must be provided');
        }

        const adminObjectId = Types.ObjectId(adminId);

        const query = { adminId: adminObjectId };

        const dataSource = new DataSource(Employee, req.query);

        const employees = await dataSource.find(query);

        res.success({
            employees,
            pageData: dataSource.pageData,
        });
    } catch (err) {
        next(err);
    }
}
