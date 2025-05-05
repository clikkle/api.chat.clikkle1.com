import { deleteFile, uploadFile } from '../../libs/fileStorage.js';
import User from '../../schema/User.js';

export default async function (req, res, next) {
    const { id } = req.user;
    const uploadedFile = req.file;

    try {
        const user = await User.findById(id);

        if (!user) {
            Error.throw('No User Found', 404);
        }

        if (!uploadedFile) Error.throw('No File Uploaded');

        if (user.photo) deleteFile(user.photo, req.user);

        const fileId = await uploadFile(uploadedFile, req.user);

        const updated = await user.updateOne({
            $set: {
                photo: fileId,
            },
        });

        if (!updated.acknowledged) Error.throw('Something went wrong', 500);

        res.success('Picture updated successfully');
    } catch (e) {
        next(e);
    }
}
