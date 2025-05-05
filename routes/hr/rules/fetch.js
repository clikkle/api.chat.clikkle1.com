import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
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

        const departmentId = req.query.departmentId;

        const dataSource = new DataSource(Rules, req.query);
        const query = {
            $expr: {
                $in: [new Types.ObjectId(departmentId), '$departmentIds'],
            },
        };

        const rules = await dataSource.aggregate([
            {
                $match: {
                    ...(departmentId ? query : {}),
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


        res.success({
            rules,
            pageDate: dataSource.pageData,
        });
    } catch (err) {
        next(err);
    }
}
