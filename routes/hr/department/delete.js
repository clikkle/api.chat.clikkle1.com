import Department from '../../../schema/Department.js';
import Employee from '../../../schema/Employee.js';
import JobListing from '../../../schema/JobListing.js';
import Notice from '../../../schema/Notice.js';
import Rules from '../../../schema/Rules.js';

export default async function (req, res, next) {
    try {
        const { id } = req.params;

        if (!id) Error.throw('Department Id must be provided', 400);

        const existsInJob = await JobListing.count({ department: id });

        if (existsInJob)
            Error.throw('This department is linked to a specific job and cannot be removed.', 400);

        const existsInEmployee = await Employee.count({ department: id });

        if (existsInEmployee)
            Error.throw(
                'This department is linked to a specific employee and cannot be removed.',
                400
            );

        const existsInNotice = await Notice.count({ departmentIds: { $in: [id] } });

        if (existsInNotice)
            Error.throw(
                'This department is linked to a specific notice and cannot be removed.',
                400
            );

        const existsInRule = await Rules.count({ departmentIds: { $in: [id] } });

        if (existsInRule)
            Error.throw(
                'This department is linked to a specific rules and regulations and cannot be removed.',
                400
            );

        const department = await Department.findByIdAndDelete(id);

        res.success({
            department,
        });
    } catch (e) {
        next(e);
    }
}
