import Employee from '../../../schema/Employee.js';

export default async function updateBankDetails(req, res, next) {
    try {
        const employeeId = req.params.employeeId;

        const { accountHolder, accountNumber, bankName, branch, ifsc, pan, city, state, country } =
            req.body;

        const updated = await Employee.updateOne(
            { _id: employeeId },
            {
                $set: {
                    'bank.accountHolder': accountHolder,
                    'bank.accountNumber': accountNumber,
                    'bank.bankName': bankName,
                    'bank.branch': branch,
                    'bank.ifsc': ifsc,
                    'bank.pan': pan,
                    'bank.city': city,
                    'bank.state': state,
                    'bank.country': country,
                },
            }
        );

        if (!updated.acknowledged) {
            throw new Error('Something went wrong, cannot update bank details');
        }

        res.status(200).json({ message: 'Bank details updated successfully' });
    } catch (err) {
        next(err);
    }
}
