import Applications from '../../../schema/JobApplication.js';
import DataSource from '../../../classes/DataSource.js';
import OfferLetter from '../../../schema/OfferLetter.js';
import Employee from '../../../schema/Employee.js';
import Agreement from '../../../schema/Agreement.js';
import Answer from '../../../schema/Answer.js';
import { Types } from 'mongoose';
import { getCache } from '../../../libs/cacheStore.js';

export default async function (req, res, next) {
    try {
        const id = req.params.id;
        const userId = req.user.id; // Assuming the userId is available in req.user
        const orgId = req.orgId;
       
        if (!orgId) {
            return res.status(400).json({ error: 'Organization ID not found in cache' });
        }

        if (id) {
            const application = await Applications.findOne({ _id: id });

            if (!application) {
                return res.status(404).json({ error: 'No Application found for id ' + id });
            }
console.log(application,"applicationapplication")
            const applicationUserId = application.userId;

            const employee = await Employee.findOne({
                _id: applicationUserId,
                adminId: new Types.ObjectId(orgId),
                status:"Active"
            });
            const answer = await Answer.findOne({
                userId: applicationUserId,
                jobId:application?.jobId
            });
console.log(answer,"answeransweranswer")
            const isAgreementSigned =
                application.agreements.length > 0 &&
                application.agreements.every(agreement => agreement.sign !== '');

            const offerLetter = await OfferLetter.findOne(
                {
                    userId: applicationUserId,
                    jobId:application?.jobId
                },
                {
                    candidateSign: 1,
                }
            );
            return res.success({
                application,
                interviewScore: answer?.score || 0,
                interviewTimeTaken: answer?.timeTaken || 'N/A',
                isInterviewCompleted: Boolean(answer),
                isOfferLetterSigned: Boolean(offerLetter?.candidateSign?.sign),
                isAgreementSigned: Boolean(isAgreementSigned),
                isEmployee: Boolean(employee),
                candidateSign: offerLetter?.candidateSign?.sign ? offerLetter.candidateSign : false,
            });
        }

        const {
            interviewSent,
            interviewed,
            offerSent,
            offerSigned,
            agreementSent,
            agreementSigned,
            employed,
            terminated,
            searchText,
            experience
        } = req.query;

        const dataSource = new DataSource(Applications, req.query, [ 'email']);
 
       let filtersExp = [];
        if(experience && experience !='null' && experience !='undefined'&& !isNaN(experience) ){
            filtersExp = [ { $match:  {experience : Number(experience) } }]
        }

        const applications = await dataSource.aggregate([
            {
                $match: { $or: [{ jobTitle: new RegExp(searchText, 'i') }, { fullName: new RegExp(searchText, 'i') }] }
            },
            {
                $match: { adminId: new Types.ObjectId(orgId) }, // Filter by orgId which matches adminId
            },
            ...filtersExp,
            {
                $project: {
                    adminId:1,
                    jobTitle: 1,
                    fullName: 1,
                    userId: 1,
                    createdAt: 1,
                    status: 1,
                    step: 1,
                    label: 1,
                    jobId:1,
                    agreements: 1,
                },
            },
            {
                $lookup: {
                    from: 'answers',
                    let: { userId: '$userId', jobId: '$jobId' },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [
                                            { $eq: ["$userId", "$$userId"] },
                                            //{ $eq: ["$jobId", "$$jobId"] }
                                        ]
                                }
                            }
                        },
                        { $project: { _id: 0 } }
                    ],
                    as: 'answer'
                }
            },
            {
                $addFields: {
                    isInterviewDone: {
                       $toBool: {
                           $ifNull: [
                              {
                                $arrayElemAt: ['$answer', 0],
                              },
                             false,
                       ],
                       },
                    },
                 }
            },
            {
                $lookup: {
                    from: 'offerletters',
                    let: { userId: '$userId', jobId: '$jobId' },
                    pipeline: [
                        {
                            $match:
                            {
                                $expr:
                                {
                                    $and:
                                        [
                                            { $eq: ["$userId", "$$userId"] },
                                            { $eq: ["$jobId", "$$jobId"] }
                                        ]
                                }
                            }
                        },
                        { $project: { _id: 0 } }
                    ],
                    as: 'offerLetter',
                },
            },
            {
                $addFields: {
                    isOfferLetterSigned: {
                        $toBool: {
                            $ifNull: [
                                {
                                    $getField: {
                                        field: 'candidateSign',
                                        input: {
                                            $arrayElemAt: ['$offerLetter', 0],
                                        },
                                    },
                                },
                                false,
                            ],
                        },
                    },
                },
            },
            {
                $addFields: {
                    isAgreementSigned: {
                        $allElementsTrue: [
                            {
                                $concatArrays: [
                                    {
                                        $map: {
                                            input: '$agreements',
                                            as: 'agreement',
                                            in: {
                                                $ne: ['$$agreement.sign', ''],
                                            },
                                        },
                                    },
                                    [
                                        {
                                            $size: ['$agreements'],
                                        },
                                    ],
                                ],
                            },
                        ],
                    },
                    agreementSent: {
                        $allElementsTrue: [
                            {
                                $concatArrays: [
                                    {
                                        $map: {
                                            input: '$agreements',
                                            as: 'agreement',
                                            in: {
                                                $eq: ['$$agreement.sign', ''],
                                            },
                                        },
                                    },
                                    [
                                        {
                                            $size: ['$agreements'],
                                        },
                                    ],
                                ],
                            },
                        ],
                    },
                },
            },
            {
                $match: { 
                    ...(interviewSent === '1' ?{ step: { $in: [1, 2, 3, 4] } } : {}),
                    ...(interviewed === '1' ?  { $or: [ { step: 1, isInterviewDone: true } , { step: { $in: [ 2, 3, 4] } } ] }: {}),
                    ...(offerSent === '1' ?    { step: { $in: [ 2, 3, 4] } } : {}),
                    ...(offerSigned === '1' ?  { $or: [ { step: 2, isOfferLetterSigned: true } ,{ step: { $in: [  3, 4] } }] }: {}),
                    ...(agreementSent === '1' ? { $or: [ { step: 3, agreementSent: true } , { step: 3, isAgreementSigned: true } , { step: 4}] }: {}),
                    ...(agreementSigned === '1' ?  { $or: [{ step: 3, isAgreementSigned: true } , { step: 4}] } : {}),
                    ...(employed === '1' ? { step: 4, status: 'Employed' } : {}),
                    ...(terminated === '1' ? { step: 4, status: 'Terminated' } : {}),
                },
            },
            {
                $project: {
                    offerLetter: 0,
                    agreement: 0,
                    answer: 0,
                    // userId: 0,
                    employee: 0,
                },
            },
        ]);

        res.success({
            applications,
            pageData: dataSource.pageData,
        });
    } catch (e) {
        next(e);
    }
}
