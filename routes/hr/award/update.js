import Award from '../../../schema/Award.js';
import Employee from '../../../schema/Employee.js';

export default async function (req, res, next) {
    try {
        const id = req.params.id;
        const { employee, department, designation, name, gift, description } = req.body;

        if (!id) Error.throw('Award Id must be provided');

        if (!employee) Error.throw('Employee Id must be provided');

        if (!(department && designation))
            Error.throw('Department and Designation must be provided');

        await Employee.updateOne({ _id: employee }, { department, designation });

        await Award.updateOne({ _id: id }, { name, gift, employeeId: employee, description });

        res.success({
            message: 'Award updated successfully',
        });
    } catch (e) {
        next(e);
    }
}
