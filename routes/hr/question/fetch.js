import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import Question from '../../../schema/Question.js';

export default async function (req, res, next) {
    try {
        // Retrieve orgId from the authenticated user's session or token
        const orgId = req.orgId;
        // Get jobId from the request parameters
        const jobId = req.params.jobId;

        // If jobId is provided, fetch the specific question
        if (jobId) {
            const question = await Question.findOne({ jobId, adminId: orgId });
            return res.success({ question });
        }

        // If no jobId is provided, fetch all questions for the organization
        const dataSource = new DataSource(Question, req.query);
        const questions = await dataSource.aggregate([
            {
                $match: { adminId: new Types.ObjectId(orgId),  } // Filter questions by adminId which is the orgId
            },
            {
                $lookup: {
                    from: 'joblistings',
                    localField: 'jobId',
                    foreignField: '_id',
                    as: 'job',
                },
            },
            {
                $addFields: {
                    title: {
                        $arrayElemAt: ['$job.title', 0],
                    },
                },
            },
            {
                $project: { job: 0 }, // Exclude job field from the result
            },
        ]);

        res.success({
            questions,
            pageData: dataSource.pageData,
        });
    } catch (err) {
        next(err);
    }
}
