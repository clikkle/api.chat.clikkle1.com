import Answer from '../../../schema/Answer.js';
import JobApplication from '../../../schema/JobApplication.js';
import Question from '../../../schema/Question.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;
        const { answers, timeTaken,orgId } = req.body;

        const jobApplication = await JobApplication.findOne({ userId,adminId:orgId }, { jobId: 1 });

        if (!jobApplication)
            return Error.throw('We were unable to locate your job application.', 404);

        const isInterviewDone = await Answer.count({ userId , jobId: jobApplication?.jobId});
        if (isInterviewDone)
            return res.success(
                'Your response has been submitted already, and the interview process is completed.'
            );

        const questions = await Question.findOne({ jobId: jobApplication?.jobId });

        let correctAnswers = 0;

        for (const answer of answers) {
            const index = questions.questions.findIndex(
                q => q._id.toString() === answer.questionId && q.answer === answer.answer
            );
            if (index !== -1) correctAnswers++;
        }

        const percentage = (correctAnswers / questions.questions.length) * 100;

        const score = Math.floor(percentage);

        const answer = new Answer({
            jobId: jobApplication.jobId,
            userId,
            answers,
            timeTaken,
            score,
        });

        await answer.save();

        res.success('Answer saved successfully');
    } catch (err) {
        next(err);
    }
}
