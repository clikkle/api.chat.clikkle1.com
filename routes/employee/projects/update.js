import FileHandler from '../../../classes/FileHandler.js';
import Project from '../../../schema/Project.js';
import { replaceImageSrc, updateImageHtml } from '../../../utils/functions.js';

export default async function (req, res, next) {
    let html = null;
    let newFiles = null;

    try {
        const employeeId = req.user.id;
        const projectId = req.params.projectId;
        const { title, description, status } = req.body;
        let startDate = undefined;
        let endDate = undefined;

        if (!projectId) Error.throw('Project Id must be provided');

        switch (status) {
            case 'Completed':
                endDate = new Date();
                break;

            case 'In Progress':
                startDate = new Date();
                break;
        }

        const project = await Project.findOne({ _id: projectId, employeeId });

        const file = new FileHandler();

        updateImageHtml(description, project.filenames);
        const files = file.decodeBase64Html(description);

        if (files.length) {
            html = replaceImageSrc(description, files);
            newFiles = [...project.filenames, ...files];
        }

        project.description = html || description;
        project.title = title;
        project.status = status;
        project.startDate = startDate;
        project.endDate = endDate;
        project.filenames = newFiles || project.filenames;

        await project.save();

        res.success('Project updated successfully');
    } catch (err) {
        next(err);
    }
}
