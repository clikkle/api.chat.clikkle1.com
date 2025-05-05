import Agreement from '../../../schema/Agreement.js';

export default async function (req, res, next) {
    try {
        const jobApplicationId = req.params.id;

        if (!jobApplicationId) Error.throw('Application Id must be provided');

        const agreement = await Agreement.findOne({ jobApplicationId });

        if (!agreement) return res.error('The agreements may not be issued yet!');

        res.success({ agreement });
    } catch (e) {
        next(e);
    }
}
