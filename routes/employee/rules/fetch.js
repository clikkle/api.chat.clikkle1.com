import DataSource from '../../../classes/DataSource.js';
import Employee from '../../../schema/Employee.js';
import Rules from '../../../schema/Rules.js';
import { Types } from 'mongoose';

export default async function (req, res, next) {
    try {
        const employeeId = req.query.empId;
        const ruleId = req.params.id;

        const employee = await Employee.findById(employeeId);

        if (ruleId) {
            const [rule] = await Rules.aggregate([
                {
                    $match: {
                        _id: new Types.ObjectId(ruleId),
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

            return res.success({ rule });
        }

        const dataSource = new DataSource(Rules, req.query);

        const rules = await dataSource.aggregate([
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
            rules,
            pageData: dataSource.pageData,
        });
    } catch (err) {
        next(err);
    }
}
