import Payslip from '../../../schema/Payslip.js';

export default async function (req, res, next) {
    try {
        const {
            employeeId,
            from,
            to,
            status,
            salary,
            salaryType,
            hraAllowance,
            conveyance,
            medicalAllowance,
            bonusAllowance,
            pf,
            professionalTax,
            tds,
            loanAndOthers,
        } = req.body;

        const payslip = new Payslip({
            employeeId,
            from,
            to,
            salary,
            salaryType,
            status,
            hraAllowance,
            conveyance,
            medicalAllowance,
            bonusAllowance,
            pf,
            professionalTax,
            tds,
            loanAndOthers,
        });

        await payslip.save();

        res.success('Payslip created successfully');
    } catch (err) {
        next(err);
    }
}
