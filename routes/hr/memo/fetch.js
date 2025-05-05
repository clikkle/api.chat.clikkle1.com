import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import Memo from '../../../schema/Memo.js';

export default async function (req, res, next) {
    try {
        const memoId = req.params.id;
        const orgId =   req.orgId ;


        if (memoId) {
            const [memo] = await Memo.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(memoId),
                        adminId: new Types.ObjectId(orgId),
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

        const departmentId = req.query.departmentId;

        const dataSource = new DataSource(Memo, req.query);
        const query = {
            $expr: {
                $in: [new Types.ObjectId(departmentId), '$departmentIds'],
            },
        };

        const memos = await dataSource.aggregate([
            {
                $match: {
                    adminId: new Types.ObjectId(orgId),
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
            memos,
            pageData: dataSource.pageData,
        });
    } catch (err) {
        next(err);
    }
}
