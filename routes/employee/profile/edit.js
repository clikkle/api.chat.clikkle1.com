// Example backend route handling employee updates
import Employee from '../../../schema/Employee.js';

export default async function updateEmployeeProfile(req, res, next) {
    try {
        const employeeId = req.params.employeeId; // Extract employeeId from URL params
        
        const {
            firstName,
            lastName,
            fatherName,
            phone,
            emergencyContact,
            dob,
            gender,
            maritalStatus,
            bloodGroup,
            presentAddress,
            permanentAddress,
        } = req.body;
       
        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            {
                firstName,
                lastName,
                fatherName,
                phone,
                emergencyContact,
                dob,
                gender,
                maritalStatus,
                bloodGroup,
                presentAddress,
                permanentAddress,
            },
            { new: true } // To return the updated document
        );

     
        if (!updatedEmployee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.status(200).json({ message: 'Employee updated successfully', employee: updatedEmployee });
    } catch (err) {
        next(err);
    }
}
