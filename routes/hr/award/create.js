import Award from '../../../schema/Award.js';
import Employee from '../../../schema/Employee.js';

export default async function (req, res, next) {
    try {
        const { employee, department, designation, name, gift, description } = req.body;
        const orgId = req.orgId ;
        if (!employee) Error.throw('Employee Id must be provided');
        if (!(department && designation))
            Error.throw('Department and Designation must be provided');

        await Employee.updateOne({ _id: employee }, { department, designation });

        const award = new Award({
            name,
            description,
            gift,
            employeeId: employee,
            adminId:orgId,

        });

        await award.save();

        res.success({
            message: 'Award created successfully',
            award,
        });
    } catch (e) {
        next(e);
    }
}
