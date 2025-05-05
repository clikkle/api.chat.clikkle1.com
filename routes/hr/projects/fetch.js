import DataSource from '../../../classes/DataSource.js';
import Project from '../../../schema/Project.js';


export default async function (req, res, next) {
    try {
        const projectId = req.params.id;
        const adminId    =  req.orgId ;

        if (projectId) {
            const project = await Project.aggregate([
                { $match: { _id: new Types.ObjectId(projectId) } },
                {
                    $lookup: {
                        from: 'employees',
                        localField: 'employeeId',
                        foreignField: '_id',
                        as: 'employee',
                        pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
                    },
                },
            ]);

            return res.success({ project });
        }

        if (req.query.employeeId) {
            req.query.employeeId = new Types.ObjectId(req.query.employeeId);
        }

        const filter = req.query.filter;

        const dataSource = new DataSource(Project, req.query, ['employeeId']);
        const projects = await dataSource.aggregate([
            {
                $match: {
                    $expr: getDateByFilter(filter, req.query),
                    adminId : new Types.ObjectId(adminId)
                },
            },
            { $project: { description: 0, updatedAt: 0 } },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'employeeId',
                    foreignField: '_id',
                    as: 'employee',
                    pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
                },
            },
            {
                $addFields: {
                    employee: { $arrayElemAt: ['$employee', 0] },
                },
            },
            {
                $project: {
                    __v: 0,
                    employeeId: 0,
                },
            },
        ]);

        res.success({
            projects,
            pageDate: dataSource.pageData,
        });
    } catch (err) {
        next(err);
    }
}

function getDateByFilter(filter, query) {
    const date = DateTime.now();

    switch (filter) {
        case 'today':
            return {
                $and: [
                    { $eq: [{ $month: '$createdAt' }, date.month] },
                    { $eq: [{ $dayOfMonth: '$createdAt' }, date.day] },
                ],
            };

        case 'week':
            return {
                $eq: [{ $week: { date: '$createdAt' } }, date.weekNumber - 1],
            };

        case 'month':
            return {
                $eq: [{ $month: '$createdAt' }, date.month],
            };

        case 'year':
            return { $eq: [{ $year: '$createdAt' }, date.year] };

        case 'custom':
            const { from, to } = query;
            return {
                $and: [
                    { $gte: ['$createdAt', new Date(from)] },
                    { $lte: ['$createdAt', new Date(to)] },
                ],
            };

        default:
            return {};
    }
}

