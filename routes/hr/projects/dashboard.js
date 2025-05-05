import DataSource from '../../../classes/DataSource.js';
import Project from '../../../schema/Project.js';
import Employee from '../../../schema/Employee.js'; // Import Employee schema
import { Types } from 'mongoose';

export default async function (req, res, next) {
    
    try {
        const adminId = req.orgId;
    
        let filter = {};
        if (adminId) {
            const adminObjectId = new Types.ObjectId(adminId); // Convert adminId to ObjectId
            filter = { adminId: adminObjectId }; // Apply filter if adminId is provided
        }

        // Query projects with the constructed filter, populate assignedTo with employee details
        const projects = await Project.find(filter)
            .populate({
                path: 'assignedTo',
                model: 'employee', // Name of the Employee model
                select: 'firstName lastName email gender' // Fields to select from the Employee model
            })
            .select('-__v') // Exclude __v field from projects
            .exec();

        if (!projects.length) {
            return res.status(402).json({ message: 'No projects found' });
        }

        res.status(200).json({
            overview: {
                projects // Return projects array under the overview key
            }
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        next(err); // Pass any errors to the error handler middleware
    }
}
