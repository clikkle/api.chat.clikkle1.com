import DataSource from '../../../classes/DataSource.js';
import Employee from '../../../schema/Employee.js';

export default async function (req, res, next) {
    try {
        const dataSource = new DataSource(Employee, req.query);
        const leaves = await dataSource.aggregate([
            {
                $lookup: {
                    from: 'leaves',
                    localField: '_id',
                    foreignField: 'employeeId',
                    as: 'totalLeaves',
                },
            },
            {
                $project: {
                    _id: 1,
                    totalLeaves: 1,
                    firstName: 1,
                    lastName: 1,
                    status: 1,
                },
            },
        ]);

        res.success({ leaves, pageData: dataSource.pageData });
    } catch (err) {
        next(err);
    }
}
