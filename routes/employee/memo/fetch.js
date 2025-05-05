import DataSource from '../../../classes/DataSource.js';
import Employee from '../../../schema/Employee.js';
import Memo from '../../../schema/Memo.js';
import { Types } from 'mongoose';

export default async function (req, res, next) {
    try {
        const employeeId = req.query.empId;
        const memoId = req.params.id;

        const employee = await Employee.findById(employeeId);

        if (memoId) {
            const [memo] = await Memo.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(memoId),
                        departmentIds: {
                            $all: [employee.department],
                        },
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

        const dataSource = new DataSource(Memo, req.query);

        const memos = await dataSource.aggregate([
            {
                $match: {
                    departmentIds: {
                        $all: [employee.department],
                    },
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
