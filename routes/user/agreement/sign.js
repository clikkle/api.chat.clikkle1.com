import JobApplication from '../../../schema/JobApplication.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;
        const { sign, agreementId, orgId } = req.body;
        if (!sign) Error.throw('Signature is required');
        
        const application = await JobApplication.updateOne(
            { userId,adminId: orgId, agreements: { $elemMatch: { agreementId } } },
            { $set: { 'agreements.$.sign': sign, 'agreements.$.signTime': new Date() } }
        );
        if (application.matchedCount === 0) Error.throw('No application found');

        if (application.modifiedCount === 0) return res.success('No changes made in agreement');

        res.success('Agreement Signed successfully');
    } catch (e) {
        next(e);
    }
}
