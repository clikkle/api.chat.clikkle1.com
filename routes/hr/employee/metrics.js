import Employee from '../../../schema/Employee.js';

export default async function (req, res, next) {
    try {
        const metrics = await Employee.aggregate([
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: {
                            $cond: {
                                if: { $eq: ['$status', 'Active'] },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                    male: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $eq: ['$status', 'Active'] },
                                        { $eq: ['$gender', 'male'] },
                                    ],
                                },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                    female: {
                        $sum: {
                            $cond: {
                                if: {
                                    $and: [
                                        { $eq: ['$status', 'Active'] },
                                        { $eq: ['$gender', 'female'] },
                                    ],
                                },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
                    terminated: {
                        $sum: {
                            $cond: {
                                if: { $eq: ['$status', 'Terminated'] },
                                then: 1,
                                else: 0,
                            },
                        },
                    },
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
