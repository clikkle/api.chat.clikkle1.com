import Department from '../../../schema/Department.js';

export default async function (req, res, next) {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const status = await Department.findByIdAndUpdate(id, {
            $set: { name },
        });

        if (!status.isModified) Error.throw('Could not update the department');

        res.success({
            message: 'Department updated successfully',
        });
    } catch (err) {
        next(err);
    }
}
