// Example backend route handling employee data
import Employee from '../../../schema/Employee.js';

export default async function (req, res, next) {
    try {
        const employeeId = req.params.employeeId;
   
        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.status(200).json({ employee });
    } catch (err) {
        next(err);
    }
}
