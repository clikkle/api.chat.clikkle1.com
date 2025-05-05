import { DateTime } from 'luxon';
import Shift from '../../../schema/Shift.js';
import Employee from '../../../schema/Employee.js';
import DataSource from '../../../classes/DataSource.js';
import { Types } from 'mongoose';

export default async function (req, res, next) {
    try {
        if (!req.query.employeeId) Error.throw('Employee ID must be provided');

        const employeeId = new Types.ObjectId(req.query.employeeId);
        const { month, year } = req.query;

        const query = {
            employeeId,
        };

        const employee = await Employee.findById(employeeId);
        const d = DateTime.fromObject(
            { month, year },
            { zone: employee.timezone }
        );

        query.clockInTime = {
            $gte: new Date(d.startOf('month')),
            $lte: new Date(d.endOf('month')),
        };

        const dataSource = new DataSource(Shift, req.query);
        const attendance = await dataSource.find(query);

        res.success({
            attendance,
            pageDate: dataSource.pageData,
        });
    } catch (err) {
        next(err);
    }
}
