import Agreement from '../../../schema/Agreement.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;
        const sign = req.body.sign;
        const addressOfEmployee = req.body.address;

        if (!sign) Error.throw('Signature is required');
        if (!addressOfEmployee) Error.throw('Address is required');

        const agreement = await Agreement.findOne({
            userId,
            'nonDisclosure.employee.sign': null,
        });

        if (!agreement) Error.throw('Could not find a agreement');

        agreement.addressOfEmployee = addressOfEmployee;
        agreement.nonDisclosure.employee.sign = sign;
        agreement.nonDisclosure.employee.time = new Date();

        await agreement.save();

        res.success({ agreement });
    } catch (e) {
        next(e);
    }
}
