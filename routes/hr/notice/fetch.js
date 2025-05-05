import { Types } from 'mongoose';
import DataSource from '../../../classes/DataSource.js';
import Notice from '../../../schema/Notice.js';

export default async function (req, res, next) {
    try {
        const noticeId = req.params.id;
        const orgId =   req.orgId ;


        if (noticeId) {
            const [notice] = await Notice.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(noticeId),
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

            return res.success({ notice });
        }

        const departmentId = req.query.departmentId;

        const dataSource = new DataSource(Notice, req.query);
        const query = {
            $expr: {
                $in: [new Types.ObjectId(departmentId), '$departmentIds'],
            },
        };

        const notices = await dataSource.aggregate([
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
            notices,
            pageData: dataSource.pageData,
        });
    } catch (err) {
        next(err);
    }
}
