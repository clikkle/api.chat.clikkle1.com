import Expenses from '../../../schema/Expense.js';

export default async function (req, res, next) {
    try {
        const expenseId = req.params.expenseId;
        const { status } = req.body;

        if (!expenseId) Error.throw('Expense ID must be provided');

        const expense = await Expenses.updateOne({ _id: expenseId }, { status });

        if (expense.matchedCount === 0) Error.throw('No Expense found by id ' + expenseId);

        if (expense.modifiedCount === 0) return res.success('No changes made in expense');

        res.success('Expense updated successfully');
    } catch (err) {
        next(err);
    }
}
