import DataSource from '../../../classes/DataSource.js';
import Project from '../../../schema/Project.js';

export default async function (req, res, next) {
    try {
        const employeeId = req.user.id;
        const projectId = req.params.id;

        if (projectId) {
            const project = await Project.findOne({
                _id: projectId,
                employeeId,
            });

            return res.success({ project });
        }

        const dataSource = new DataSource(Project, req.query);
        const projects = await dataSource.aggregate([
            {
                $match: { employeeId },
            },
            {
                $project: {
                    description: 0,
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
