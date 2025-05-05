import DataSource from '../../../classes/DataSource.js';
import Expense from '../../../schema/Expense.js';
import { Types } from 'mongoose';

export default async function (req, res, next) {
    const employeeId = new Types.ObjectId(req.query.empId);

    try {
        const dataSource = new DataSource(Expense, req.query);
        const expenses = await dataSource.find({
            employeeId,
        });

        res.success({ expenses, pageData: dataSource.pageData });
    } catch (err) {
        next(err);
    }
}
