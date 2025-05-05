import Question from '../../../schema/Question.js';

export default async function (req, res, next) {
    try {
        const jobId = req.params.jobId;

        if (!jobId) Error.throw('Id must be provided to delete');

        const updated = await Question.deleteOne({ jobId });

        if (!updated.acknowledged)
            Error.throw('Something went wrong, cannot delete questions', 500);

        res.success('Question deleted successfully');
    } catch (err) {
        next(err);
    }
}
