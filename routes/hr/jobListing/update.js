import JobListing from '../../../schema/JobListing.js';
import { filterObject } from '../../../utils/functions.js';

export default async function (req, res, next) {
    const { id } = req.params;
    const updateField = req.body;

    const updatesAllowed = [
        'title',
        'department',
        'location',
        'experience',
        'details',
        'jobType',
        'salary',
        'remote',
    ];

    try {
        const job = await JobListing.findById(id);

        if (!job) {
            Error.throw('Job Not Found', 404);
        }

        const updatedJob = await job.updateOne({
            $set: filterObject(updateField, updatesAllowed),
        });

        const { acknowledged, modifiedCount } = updatedJob;

        if (!acknowledged) {
            Error.throw('Something went wrong', 500);
        }

        res.success(modifiedCount ? 'Job updated successfully' : 'No change in Job');
    } catch (e) {
        next(e);
    }
}
