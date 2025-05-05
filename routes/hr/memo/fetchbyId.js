import { Types } from 'mongoose';
import Memo from '../../../schema/Memo.js';

export default async function getNoticeById(req, res, next) {
    try {
        const memoId = req.params.memoId;

        if (memoId) {
            const [memo] = await Memo.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(memoId),
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

            return res.success({ memo });
        }

        res.status(400).json({ message: 'Memo ID is required' });
    } catch (err) {
        next(err);
    }
}
