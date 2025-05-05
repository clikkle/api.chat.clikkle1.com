import DataSource from '../../../classes/DataSource.js';
import Expense from '../../../schema/Expense.js';

export default async function (req, res, next) {
    try {
        const dataSource = new DataSource(Expense, req.query);
        const expenses = await dataSource.find({});

        res.success({ expenses, pageData: dataSource.pageData });
    } catch (err) {
        next(err);
    }
}
