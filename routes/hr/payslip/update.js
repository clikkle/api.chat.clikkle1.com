import Payslip from '../../../schema/Payslip.js';

export default async function (req, res, next) {
    try {
        const { from, to, status, salary,salaryType } = req.body;
        const payslipId = req.params.id;

        const updated = await Payslip.updateOne(
            { _id: payslipId },
            {
                $set: {
                    from,
                    to,
                    status,
                    salary,
                    salaryType,
                },
            }
        );

        if (updated.modifiedCount === 0)
            Error.throw('Something went wrong, cannot update payslip', 500);

        res.success('Payslip updated successfully');
    } catch (err) {
        next(err);
    }
}
