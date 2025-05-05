import FileHandler from '../../../classes/FileHandler.js';
import Project from '../../../schema/Project.js';
import { replaceImageSrc } from '../../../utils/functions.js';

export default async function (req, res, next) {
    try {
        const employeeId = req.user.id;
        const { title, description } = req.body;

        const file = new FileHandler();

        const filenames = file.decodeBase64Html(description);
        const html = replaceImageSrc(description, filenames);

        const project = new Project({
            title,
            description: html,
            employeeId,
            filenames,
        });

        await project.save();

        res.success('Project created successfully');
    } catch (err) {
        next(err);
    }
}
