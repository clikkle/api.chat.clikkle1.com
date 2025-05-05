import { Types } from 'mongoose';
import Department from '../../../schema/Department.js';
import Employee from '../../../schema/Employee.js';
import Expense from '../../../schema/Expense.js';
import JobApplication from '../../../schema/JobApplication.js';
import Notice from '../../../schema/Notice.js';
import Payslip from '../../../schema/Payslip.js';
import Shift from '../../../schema/Shift.js';
import DataSource from '../../../classes/DataSource.js';
import Leave from '../../../schema/Leave.js';
import { DateTime } from 'luxon';

export default async function (req, res, next) {
    try {
        const orgId = req?.orgId || null ;
        const timeKey = (req.query.key || 'AM').toUpperCase();

        // Convert orgId to ObjectId
        if(!orgId || orgId == null ){
            throw new Error('Admin ID must be provided');
        }
        const orgObjectId = new Types.ObjectId(orgId);

        const [employees] = await Employee.aggregate([
            {
                $match: {
                    status: 'Active',
                    adminId: orgObjectId, // Match adminId with orgObjectId
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    male: { $sum: { $cond: { if: { $eq: ['$gender', 'Male'] }, then: 1, else: 0 } } },
                    female: { $sum: { $cond: { if: { $eq: ['$gender', 'Female'] }, then: 1, else: 0 } } },
                },
            },
        ]);

        const departments = await Department.countDocuments({ adminId: orgObjectId });

        const applications = await JobApplication.aggregate([
            {
                $match: {
                    adminId: orgObjectId,
                },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'joblistings',
                    localField: 'jobId',
                    foreignField: '_id',
                    as: 'job',
                },
            },
            {
                $addFields: {
                    jobTitle: { $arrayElemAt: ['$job.title', 0] },
                },
            },
            {
                $project: {
                    fullName: 1,
                    jobTitle: 1,
                    experience: 1,
                    email: 1,
                    createdAt: 1,
                    countryCode: 1,
                },
            },
        ]);

        const expenses = await Expense.aggregate([
            {
                $match: {
                    status: 'Approved',
                    adminId: orgObjectId,
                },
            },
            {
                $group: {
                    _id: '$dateOfPurchase.month',
                    price: { $sum: '$price.amount' },
                },
            },
        ]);

        const notices = await Notice.aggregate([
            {
                $match: {
                    status: 'active',
                    adminId: orgObjectId,
                },
            },
            { $limit: 9 },
            {
                $addFields: {
                    //caption: { $substr: ['$content', 0, 50] },
                    caption:'$content'
                },
            },
            {
                $project: {
                    content: 0,
                    departmentIds: 0,
                },
            },
            { $sort: { createdAt: -1 } },
        ]);

        const attendance = await Shift.aggregate([
            {
                $match: {
                    $expr: {
                        $lte: ['$clockInTime', new Date()],
                    },
                    adminId: orgObjectId,
                },
            },
            { $sort: { _id: -1 } },
            {
                $lookup: {
                    from: 'employees',
                    localField: 'employeeId',
                    foreignField: '_id',
                    as: 'employeeData',
                    pipeline: [
                        {
                            $match: {
                                //adminId: orgObjectId,
                                status:"Active"
                            },
                        },
                        {
                            $project: {
                                firstName: 1,
                                lastName: 1,
                                role:1,
                                shiftStart:1,
                                shiftEnd:1
                            },
                        },
                    ],
                },
            },
            { $limit: 5 },
            {
                $unwind: {
                    path: '$employeeData',
                },
            },
        ]);

        const salaries = await Payslip.aggregate([
            {
                $match: {
                    status: 'paid',
                    adminId: orgObjectId,
                },
            },
            {
                $addFields: {
                    month: {
                        $month: '$createdAt',
                    },
                },
            },
            {
                $group: {
                    _id: '$month',
                    salary: {
                        $sum: {
                            $toInt: '$salary',
                        },
                    },
                },
            },
        ]);

        const dataSource = new DataSource(Leave, req.query);
        const leaves = await dataSource.aggregate([
            {
                $match: {
                    status: 'Pending',
                },
             },
              { 
                $lookup: {
                    from: 'employees',
                    localField: 'employeeId',
                    foreignField: '_id',
                    as: 'empData',
                },
            },
            {
                $match: {
                  "empData.adminId": orgObjectId
                }
            },
        
            {
                $addFields: {
                    empData: {
                        $arrayElemAt: ['$empData', 0],
                    },
                },
            },
            {
                $addFields: {
                    fullName: {
                        $concat: [
                            '$empData.firstName',
                            ' ',
                            '$empData.lastName',
                        ],
                    },
                    department: '$empData.department',
                },
            },
            {
                $project: {
                    empData: 0,
                },
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'department',
                    foreignField: '_id',
                    as: 'department',
                },
            },
            {
                $addFields: {
                    department: {
                        $getField: {
                            field: 'name',
                            input: {
                                $arrayElemAt: ['$department', 0],
                            },
                        },
                    },
                },
            },
        ]);


        // const startOfDay = new Date();
        // startOfDay.setHours(0, 0, 0, 0);
        
        // const endOfDay = new Date();
        // endOfDay.setHours(23, 59, 59, 999);
        
        // const todayShifts = await Shift.find({
        //     clockInTime: { $gte: startOfDay, $lte: endOfDay },
        //     adminId: orgObjectId,
        // }).select('employeeId status clockInTime');
        
        // const shiftMap = new Map();
        // todayShifts.forEach(shift => {
        //     shiftMap.set(shift.employeeId.toString(), {
        //         status: shift.status,
        //         clockInTime: shift.clockInTime,
        //     });
        // });
        // const employeeAttendanceStatus = await Employee.aggregate([
        //     {
        //         $match: {
        //             adminId: orgObjectId,
        //             status: 'Active',
        //         },
        //     },
        //     {
        //         $project: {
        //             firstName: 1,
        //             lastName: 1,
        //             role: 1,
        //         },
        //     },
        // ]);
        
        // const employeeAttendanceList = employeeAttendanceStatus.map(emp => {
        //     const shiftData = shiftMap.get(emp._id.toString()); 
           
        //    const status = shiftData?.status || 'Absent';
        //     const time = shiftData?.clockInTime
        // ? 'Clocked-In'
        // : 'Not Yet Clocked-In';
        //     return {
        //         ...emp,
        //         attendence:status,
        //         time,
        //         name:emp?.firstName + " " + emp?.lastName,
        //         img_url:"/images/profileImg2.png"
        //     };
        // });

        // Time bounds for AM/PM

// Helper to determine AM/PM from shiftStart object
const isAMShift = (shiftStart) => {
    return shiftStart?.hour < 12;
};

// Step 1: Get all employees with shiftStart info
const employeesList = await Employee.aggregate([
    {
        $match: {
            adminId: orgObjectId,
            status: 'Active',
        },
    },
    {
        $project: {
            firstName: 1,
            lastName: 1,
            role: 1,
            shiftStart: 1,
        },
    },
]);

// Step 2: Filter employees by AM/PM shiftStart
const filteredEmployees = employeesList.filter(emp => {
    if (!emp.shiftStart) return false;
    const isAM = isAMShift(emp.shiftStart);
    return timeKey === 'AM' ? isAM : !isAM;
});

const employeeIds = filteredEmployees.map(emp => emp._id);

// Step 3: Time range for today
const startOfDay = DateTime.local().startOf('day').toJSDate();
const endOfDay = DateTime.local().endOf('day').toJSDate();

// Step 4: Fetch today's shift data for these employees
const todayShifts = await Shift.find({
    clockInTime: { $gte: startOfDay, $lte: endOfDay },
    adminId: orgObjectId,
    employeeId: { $in: employeeIds },
}).select('employeeId status clockInTime');

const shiftMap = new Map();
todayShifts.forEach(shift => {
    shiftMap.set(shift.employeeId.toString(), {
        status: shift.status,
        clockInTime: shift.clockInTime,
    });
});

// Step 5: Build final attendance list
const employeeAttendanceList = filteredEmployees.map(emp => {
    const shiftData = shiftMap.get(emp._id.toString());
    const status = shiftData?.status || 'Absent';
    const time = shiftData?.clockInTime ? 'Clocked-In' : 'Not Yet Clocked-In';

    return {
        ...emp,
        attendence: status,
        time,
        name: emp.firstName + " " + emp.lastName,
        img_url: "/images/profileImg2.png"
    };
});

        res.success({
            overview: {
                employeeAttendanceList,
                employees,
                departments,
                expenses,
                applications,
                notices,
                attendance,
                salaries,
                leave:leaves[0]
            },
        });
    } catch (e) {
        next(e);
    }
}
