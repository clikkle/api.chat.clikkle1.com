import { deleteFile, uploadFile } from '../../../libs/fileStorage.js';
import Employee from '../../../schema/Employee.js';
import mongoose from 'mongoose';

export default async function (req, res, next) {
    try {
        const { id } = req.params; // Fetch the id from req.params

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const uploadedFile = req.file;

        if (!uploadedFile) {
            return res.status(400).json({ error: 'Photo must be provided' });
        }

        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        // Deleting the old file
        await deleteFile(employee.photo, req.user);

        // Uploading the new file
        const fileId = await uploadFile(uploadedFile, req.user);

        employee.photo = fileId;
        await employee.save();

        res.status(200).json({ photo: fileId });
    } catch (err) {
        console.error(err); // Log the error for debugging
        next(err);
    }
}
