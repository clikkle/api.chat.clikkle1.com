import { DateTime } from 'luxon';
import DataSource from '../../../classes/DataSource.js';
import Employee from '../../../schema/Employee.js';
import Shift from '../../../schema/Shift.js';
import { Types } from 'mongoose';
import Holiday from '../../../schema/Holiday.js';

export default async function (req, res, next) {
    try {
        const employeeId = req.params.employeeId;
        const { month = null , year = null } = req.query;
        const  adminId  =  new Types.ObjectId(req.orgId)  ;
        let data = {};

        // Get the current date
        const monthDate = month ?  new Date(month) :  new Date();    
        const yearDate = year ?  new Date(year)  :  new Date();   
        // Get the first day of the current month
        const firstDayOfMonth = new Date(yearDate.getFullYear(), monthDate.getMonth(), 1);   
        // Get the first day of the next month
        const firstDayOfNextMonth = new Date(yearDate.getFullYear(), monthDate.getMonth() + 1, 1);

        // Query to count holidays within the current month
        const holidayCount = await Holiday.countDocuments({
            adminId:adminId,
            date: {
                $gte: firstDayOfMonth,
                $lt: firstDayOfNextMonth
            }
        }).exec();

        if (employeeId){
            // const employee = await Employee.findById(employeeId);
             data = await Shift.aggregate([
                {
                    $match: {
                        employeeId: new Types.ObjectId(employeeId),
                        adminId: adminId,
                        clockInTime: {
                            $gte: firstDayOfMonth,
                            $lte: firstDayOfNextMonth,
                        },   
                    },
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);
        } else {
         data = await Shift.aggregate([
            {
                $match: {
                    adminId:adminId,
                    clockInTime: {
                        $gte: firstDayOfMonth,
                        $lte: firstDayOfNextMonth,
                    }, 
                },
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        }

        let working = countWorkingDays( yearDate.getFullYear() , monthDate.getMonth()) ?? 0
        working = working - holidayCount;

        let monthData ={}

        data.forEach(doc => {
            monthData[doc._id] = doc.count;
        });
        res.success({
            working,
            holidays : holidayCount,
            ...monthData ,
        });
    } catch (err) {
        next(err);
    }
}

function countWorkingDays(year, month) {
    let workingDaysCount = 0;
  
    // Get the number of days in the given month
    let daysInMonth = new Date(year, month + 1, 0).getDate();
  
    for (let day = 1; day <= daysInMonth; day++) {
      let currentDate = new Date(year, month, day);
      let dayOfWeek = currentDate.getDay();
  
      // Exclude Sundays (0) and Saturdays (6)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDaysCount++;
      }
    }
  
    return workingDaysCount;
  }

function getMaxDate(d1, d2) {
    if (d1 > d2) return d1;
    else return d2;
}
