import { Types } from 'mongoose';
// import DataSource from '../../../classes/DataSource.js';
import Rules from '../../../schema/Rules.js';

export default async function (req, res, next) {
    try {
      

        const ruleId = req.params.ruleId;
        if (ruleId) {
            const [rule] = await Rules.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(ruleId),
                        
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

            return res.success({ rule });
        }

        res.status(400).json({ message: 'Rules ID is required' });

    } catch (err) {
        next(err);
    }
}
