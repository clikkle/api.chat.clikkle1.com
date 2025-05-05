import Question from '../../../schema/Question.js';

export default async function (req, res, next) {
    try {
        const { jobId, questions } = req.body;

        const updated = await Question.updateOne({ jobId }, { $set: { questions } });

        if (!updated.acknowledged) Error.throw('Something went wrong, cannot add questions', 500);

        res.success('Questions added successfully');
    } catch (err) {
        next(err);
    }
}
