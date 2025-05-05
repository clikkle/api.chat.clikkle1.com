import DataSource from '../../../classes/DataSource.js';
import Employee from '../../../schema/Employee.js';
import Notice from '../../../schema/Notice.js';

export default async function (req, res, next) {
    try {
        // const employeeId = req.user.id;
        const employeeId = req.query.empId;
        const noticeId = req.params.id;

        const employee = await Employee.findById(employeeId);

        if (noticeId) {
            const notice = await Notice.findOne({
                _id: noticeId,
                departmentIds: {
                    $all: [employee.department],
                },
            });

            return res.success({ notice });
        }

        const dataSource = new DataSource(Notice, req.query);
        const notices = await dataSource.find({
            departmentIds: {
                $all: [employee.department],
            },
        });

        res.success({
            notices,
            pageDate: dataSource.pageData,
        });
    } catch (err) {
        next(err);
    }
}
