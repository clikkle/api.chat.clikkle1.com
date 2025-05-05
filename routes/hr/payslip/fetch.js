import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import Payslip from '../../../schema/Payslip.js';

export default async function (req, res, next) {
    try {
        const employeeId = req.params.employeeId;
        const adminId = new Types.ObjectId(req.orgId);

        if (employeeId) {
            const dataSource = new DataSource(Payslip, req.query);
            const payslips = await dataSource.find({ employeeId: new Types.ObjectId(employeeId) });
            return res.success({
                payslips,
                pageDate: dataSource.pageData,
            });
        }

        const dataSource = new DataSource(Payslip, req.query);
        const payslips = await dataSource.aggregate([
            {
                $lookup: {
                    from: 'employees',
                    localField: 'employeeId',
                    foreignField: '_id',
                    as: 'employee',
                    pipeline: [{
                        $match: {
                          adminId: adminId    // Filter by adminID in the joined `employees` documents
                        }
                    },{ $project: { firstName: 1, lastName: 1 } }],
                },
            },
            {
                $unwind: {
                    path: '$employee',
                },
            }
            // {
            //     $addFields: {
            //         employee: { $arrayElemAt: ['$employee', 0] },
            //     },
            // },
        ]);

        res.success({
            payslips,
            pageDate: dataSource.pageData,
        });
    } catch (err) {
        next(err);
    }
}
