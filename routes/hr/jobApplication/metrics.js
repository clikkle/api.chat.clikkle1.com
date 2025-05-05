import Applications from '../../../schema/JobApplication.js';
import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import OfferLetter from '../../../schema/OfferLetter.js';
import Employee from '../../../schema/Employee.js';
import Agreement from '../../../schema/Agreement.js';
import Answer from '../../../schema/Answer.js';

// export default async function (req, res, next) {
//     try {
//         const id = req.params.id;
//         const userId = req.user.id; // Assuming the userId is available in req.user
//         // Retrieve the orgId from the cache using the userId (assuming this maps to adminId)
//         const orgId = req.orgId 
//         if (!orgId) {
//             return res.status(400).json({ error: 'Organization ID not found in cache' });
//         }

//         if (id) {
//             const application = await Applications.findOne({ _id: id, adminId: orgId });

//             if (!application) {
//                 return res.status(404).json({ error: 'No Application found for id ' + id });
//             }

//             const applicationUserId = application.userId;

//             const employee = await Employee.findOne({ _id: applicationUserId, adminId: orgId });
//             const answer = await Answer.findOne({ userId: applicationUserId, adminId: orgId });

//             const isAgreementSigned =
//                 application.agreements.length > 0 &&
//                 application.agreements.every(agreement => agreement.sign !== '');

//             const offerLetter = await OfferLetter.findOne(
//                 {
//                     userId: applicationUserId,
//                     adminId: orgId,
//                 },
//                 {
//                     candidateSign: 1,
//                 }
//             );

//             return res.success({
//                 application,
//                 interviewScore: answer?.score || 0,
//                 interviewTimeTaken: answer?.timeTaken || 'N/A',
//                 isInterviewCompleted: Boolean(answer),
//                 isOfferLetterSigned: Boolean(offerLetter?.candidateSign?.sign),
//                 isAgreementSigned: Boolean(isAgreementSigned),
//                 isEmployee: Boolean(employee),
//                 candidateSign: offerLetter?.candidateSign?.sign ? offerLetter.candidateSign : false,
//             });
//         }

//         const {
//             interviewSent,
//             interviewed,
//             offerSent,
//             offerSigned,
//             agreementSent,
//             agreementSigned,
//             employed,
//             terminated,
//         } = req.query;

//         const dataSource = new DataSource(Applications, req.query, ['experience', 'email']);

//         const applications = await dataSource.aggregate([
//             {
//                 $match: { adminId: orgId }, // Filter by orgId which matches adminId
//             },
//             {
//                 $project: {
//                     jobTitle: 1,
//                     fullName: 1,
//                     userId: 1,
//                     createdAt: 1,
//                     status: 1,
//                     step: 1,
//                     label: 1,
//                     agreements: 1,
//                 },
//             },
//             {
//                 $lookup: {
//                     from: 'answers',
//                     localField: 'userId',
//                     foreignField: 'userId',
//                     as: 'answer',
//                 },
//             },
//             {
//                 $addFields: {
//                     isInterviewDone: {
//                         $toBool: {
//                             $ifNull: [
//                                 {
//                                     $arrayElemAt: ['$answer', 0],
//                                 },
//                                 false,
//                             ],
//                         },
//                     },
//                 },
//             },
//             {
//                 $lookup: {
//                     from: 'offerletters',
//                     localField: 'userId',
//                     foreignField: 'userId',
//                     as: 'offerLetter',
//                 },
//             },
//             {
//                 $addFields: {
//                     isOfferLetterSigned: {
//                         $toBool: {
//                             $ifNull: [
//                                 {
//                                     $getField: {
//                                         field: 'candidateSign',
//                                         input: {
//                                             $arrayElemAt: ['$offerLetter', 0],
//                                         },
//                                     },
//                                 },
//                                 false,
//                             ],
//                         },
//                     },
//                 },
//             },
//             {
//                 $addFields: {
//                     isAgreementSigned: {
//                         $allElementsTrue: [
//                             {
//                                 $concatArrays: [
//                                     {
//                                         $map: {
//                                             input: '$agreements',
//                                             as: 'agreement',
//                                             in: {
//                                                 $ne: ['$$agreement.sign', ''],
//                                             },
//                                         },
//                                     },
//                                     [
//                                         {
//                                             $size: ['$agreements'],
//                                         },
//                                     ],
//                                 ],
//                             },
//                         ],
//                     },
//                     agreementSent: {
//                         $allElementsTrue: [
//                             {
//                                 $concatArrays: [
//                                     {
//                                         $map: {
//                                             input: '$agreements',
//                                             as: 'agreement',
//                                             in: {
//                                                 $eq: ['$$agreement.sign', ''],
//                                             },
//                                         },
//                                     },
//                                     [
//                                         {
//                                             $size: ['$agreements'],
//                                         },
//                                     ],
//                                 ],
//                             },
//                         ],
//                     },
//                 },
//             },
//             {
//                 $match: {
//                     ...(interviewSent === '1' ? { step: 1, isInterviewDone: false } : {}),
//                     ...(interviewed === '1' ? { step: 1, isInterviewDone: true } : {}),
//                     ...(offerSent === '1' ? { step: 2, isOfferLetterSigned: false } : {}),
//                     ...(offerSigned === '1' ? { step: 2, isOfferLetterSigned: true } : {}),
//                     ...(agreementSent === '1' ? { step: 3, agreementSent: true } : {}),
//                     ...(agreementSigned === '1' ? { step: 3, isAgreementSigned: true } : {}),
//                     ...(employed === '1' ? { step: 4, status: 'Employed' } : {}),
//                     ...(terminated === '1' ? { step: 4, status: 'Terminated' } : {}),
//                 },
//             },
//             {
//                 $project: {
//                     offerLetter: 0,
//                     agreement: 0,
//                     answer: 0,
//                     userId: 0,
//                     employee: 0,
//                 },
//             },
//         ]);

//         res.success({
//             applications,
//             pageData: dataSource.pageData,
//         });
//     } catch (e) {
//         next(e);
//     }
// }

export default async function (req, res, next) {
    try {

        let orgId =  req.orgId;
        const metrics = await Applications.aggregate([
            {
                $match: { adminId: new Types.ObjectId(orgId),  } // Filter questions by adminId which is the orgId
            },
            {
                $project: {
                    jobTitle: 1,
                    fullName: 1,
                    userId: 1,
                    createdAt: 1,
                    step: 1,
                    status: 1,
                    agreements: 1,
                },
            },
            {
                $lookup: {
                    from: 'offerletters',
                    localField: 'userId',
                    foreignField: 'userId',
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
                $lookup: {
                    from: 'answers',
                    localField: 'userId',
                    foreignField: 'userId',
                    as: 'answer',
                },
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
                $group: {
                    _id: null,
                    applied: {
                        $sum: 1,
                    },
                    interviewSent: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $eq: ['$isInterviewDone', false] },
                                        { $eq: ['$step', 1] },
                                    ],
                                },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                    interviewed: {
                        $sum: {
                            $cond: {
                                if: { $and: ['$isInterviewDone', { $eq: ['$step', 1] }] },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                    offerSent: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $eq: ['$isOfferLetterSigned', false] },
                                        { $eq: ['$step', 2] },
                                    ],
                                },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                    offerSigned: {
                        $sum: {
                            $cond: {
                                if: { $and: ['$isOfferLetterSigned', { $eq: ['$step', 2] }] },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                    agreementSent: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $eq: ['$isAgreementSigned', false] },
                                        { $eq: ['$step', 3] },
                                    ],
                                },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                    agreementSigned: {
                        $sum: {
                            $cond: {
                                if: { $and: ['$isAgreementSigned', { $eq: ['$step', 3] }] },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                    employed: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [{ $eq: ['$status', 'Employed'] }, { $eq: ['$step', 4] }],
                                },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                    terminated: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $eq: ['$status', 'Terminated'] },
                                        { $eq: ['$step', 4] },
                                    ],
                                },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                },
            },
        ]);

        res.success({
            metrics,
        });
    } catch (e) {
        next(e);
    }
}

