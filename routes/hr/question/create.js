import Question from '../../../schema/Question.js';
import { getCache } from '../../../libs/cacheStore.js';

export default async function (req, res, next) {
    try {
        const { jobId, questions } = req.body;

        if (!jobId) {
            Error.throw('jobId must be provided' , 400);
        }
        if (!questions?.length) {
             Error.throw('Questions must be provided', 400);
        }

        const orgId = req.orgId ; 
        
        const exists = await Question.findOne({ jobId });

        if (exists) {
            Error.throw('The Question you are trying to create already exists for this job.', 400);
        }
        const question = new Question({
            jobId,
            questions,
            adminId: orgId, 
        });

        await question.save();

        res.success('Question created successfully');
    } catch (err) {
        next(err);
    }
}
