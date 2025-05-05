import Payslip from '../../../schema/Payslip.js';

export default async function (req, res, next) {
    try {
        const id = req.params.id;

        if (!id) Error.throw('Id must be provided to delete');

        await Payslip.deleteOne({ _id: id });

        res.success('Payslip deleted successfully');
    } catch (err) {
        next(err);
    }
}
