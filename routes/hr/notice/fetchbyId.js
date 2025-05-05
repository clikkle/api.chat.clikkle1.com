import { Types } from 'mongoose';
import Notice from '../../../schema/Notice.js';

export default async function getNoticeById(req, res, next) {
    try {
        const noticeId = req.params.noticeId;

        if (noticeId) {
            const [notice] = await Notice.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(noticeId),
                    },
                },
                {
                    $lookup: {
                        from: 'departments',
                        localField: 'departmentIds',
                        foreignField: '_id',
                        as: 'departments',
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                },
                            },
                        ],
                    },
                },
            ]);

            return res.success({ notice });
        }

        res.status(400).json({ message: 'Notice ID is required' });
    } catch (err) {
        next(err);
    }
}
