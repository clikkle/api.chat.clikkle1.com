import JObListing from '../../../schema/JobListing.js';

export default async function (req, res, next) {
    try {
        const { id } = req.params;

        const job = await JObListing.findByIdAndDelete(id);

        res.success({
            deletedJob: job,
        });
    } catch (e) {
        next(e);
    }
}
