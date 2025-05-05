import Answer from '../../../schema/Answer.js';
import JobApplication from '../../../schema/JobApplication.js';
import Question from '../../../schema/Question.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;
console.log(req.query.orgId,"req.query.orgId")


const jobApplication = await JobApplication.findOne({ userId ,adminId:req.query.orgId }).sort({ createdAt: -1 });


        if (!jobApplication)
    return Error.throw('We were unable to locate your job application.', 404);

         const isInterviewDone = await Answer.count({ userId , jobId:jobApplication?.jobId });

        if (isInterviewDone)
            return res.success({
                message: 'Your response has been submitted, and the interview process is complete.',
                questions: null,
                isInterviewDone: Boolean(isInterviewDone),
            });


        if (jobApplication.step !== 1)
            return res.success({
                message:
                    'Your interview scheduling is pending, and we apologize for any inconvenience.',
                questions: null,
            });

        const jobCategory = await Question.findOne({ jobId: jobApplication?.jobId });

        if (!jobCategory)
            Error.throw('No questions have been generated within this job category.', 404);

        jobCategory.questions.forEach(question => (question.answer = undefined));

        res.success({ questions: jobCategory, isInterviewDone: Boolean(isInterviewDone) });
    } catch (err) {
        next(err);
    }
}
