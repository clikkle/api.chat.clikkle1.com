import { acceptFiles, rejectFiles } from '../../../utils/functions.js';
import Expense from '../../../schema/Expense.js';
import FileHandler from '../../../classes/FileHandler.js';

export default async function (req, res, next) {
    let invoice;
    const file = new FileHandler();

    try {
        const employeeId = req.query.empId;
        const { title, purchasePlace, price, dateOfPurchase, note } = req.body;

        if (!req.files) Error.throw('Invoice must be provided');

        if (!req.files.invoice) Error.throw('Invoice must be provided');
        invoice = req.files.invoice[0].filename;

        const expense = new Expense({
            employeeId,
            title,
            purchasePlace,
            price,
            dateOfPurchase,
            note,
            invoice,
        });

        await expense.save();

        res.success({
            message: 'Expense saved successfully',
            expense,
        });
    } catch (e) {
        file.deleteFiles(invoice);
        next(e);
    }
}
