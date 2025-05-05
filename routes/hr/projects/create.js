import FileHandler from '../../../classes/FileHandler.js';
import Project from '../../../schema/Project.js';
import { replaceImageSrc } from '../../../utils/functions.js';
import mongoose from 'mongoose';

export default async function (req, res, next) {
    try {
        const { title, description, employeeId, assignedTo, priority, startDate, endDate, to, from, assignedTeam , client } = req.body;

        const file = new FileHandler();
        const filenames = file.decodeBase64Html(description);
        const html = replaceImageSrc(description, filenames);

        const adminId = req.orgId;

        // Convert assignedTeam keys to ObjectIds
      



        const project = new Project({
            title,
            description: html,
            assignedTo, // Array of user ObjectId
            priority,
            adminId,
            startDate: new Date(to), // Assuming 'to' and 'from' are date strings
            endDate: new Date(from),
            filenames,
            client,
        });

        await project.save();

        res.success('Project created successfully');
    } catch (err) {
        next(err);
    }
}
