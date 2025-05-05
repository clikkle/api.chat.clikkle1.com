import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import Payslip from '../../../schema/Payslip.js';

export default async function (req, res, next) {
    try {
        const employeeId = req.query.empId;

        const dataSource = new DataSource(Payslip, req.query);
        const payslips = await dataSource.aggregate([
            {
                $match: {
                    employeeId: new Types.ObjectId(employeeId),
                },
            },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'employeeId',
                    foreignField: '_id',
                    as: 'employee',
                    pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
                },
            },
            {
                $addFields: {
                    employee: { $arrayElemAt: ['$employee', 0] },
                },
            },
        ]);

        return res.success({
            payslips,
            pageDate: dataSource.pageData,
        });
    } catch (err) {
        next(err);
    }
}
