import { DateTime, Info } from 'luxon';
import Employee from '../../../schema/Employee.js';
import User from '../../../schema/User.js';
import JobApplication from '../../../schema/JobApplication.js';
import JobListing from '../../../schema/JobListing.js';
import { formatTime, generateTemplate, getOrganization, getUserDetails } from '../../../utils/functions.js';
import {sendSESEmail } from '../../../libs/sendEmailSES.js';
import checkEmployeeLimit from './checkEmployeeLimit.js';
import transporter from '../../../libs/nodemailer.js';
import fs from 'fs';
import { Types } from 'mongoose';

export default async function (req, res, next) {
    try {
        const { userId, //  throw  api  call
            department, dateOfJoining, shiftStart, shiftEnd, timezone, jobType  ,
            firstName,
            lastName,
            phone, //   
            countryCode,  //   
            email, //
            salary,
            currency,

            designation
         } = req.body;
        const adminId =req.orgId;
   
        if (!userId || !adminId) throw new Error('User ID and admin ID must be provided');

        let  organization =  await  getOrganization(req.orgId)

        const user = await getUserDetails(userId);
        if (!user) throw new Error(`User not found for ID: ${userId}`);

        if (!Info.isValidIANAZone(timezone)) throw new Error('Invalid timezone provided');

        const dateObj = new Date(dateOfJoining);
        const relativeDateOfJoining = DateTime.fromObject(
            {
                year: dateObj.getFullYear(),
                month: dateObj.getMonth() + 1,
                day: dateObj.getDate(),
            },
            { zone: timezone }
        );

        const designationData = await JobListing.findById(designation);
        if (!designationData) throw new Error(`Job listing not found for ID: ${designation}`);

        let checkMaxLimit    =  await checkEmployeeLimit(organization);

        if(!checkMaxLimit?.success){
            Error.throw(checkMaxLimit.message);  
        }

        const employee = new Employee({
            _id: user._id,
            adminId: adminId,
            firstName: firstName,
            lastName: lastName,
            phone: {
                phone: user.phone,
                countryCode: user?.countryCode ?? "",
            },
            dob: user.dob,
            gender: user.gender,
            email:  user?.recoveryEmail ,
            department,
            designation: designationData,
            role:designationData.jobTitle || "",
            dateOfJoining: relativeDateOfJoining,
            salary: {
                currency: currency,
                amount: salary,
            },
            shiftStart,
            shiftEnd,
            timezone,
            jobType,
        });

        // jobApplication.step = 4;
        // jobApplication.status = 'Employed';
        // user.role = 'employee';

        await employee.save();
        // await jobApplication.save();
        // await user.save();

        res.success('Employee saved successfully');

      

        sendEmail(employee, designation , organization);
    } catch (err) {
        next(err);
    }
}

async function sendEmail(employee, designation ,organization) {
    try {
        const currentYear = new Date().getFullYear();
        const html = fs.readFileSync('templates/email/notifyEmployee.html', {
            encoding: 'utf-8',
        });

        const data = {
            name: employee.firstName + ' ' + employee.lastName,
            jobTitle: designation.title,
            currentYear,
            joiningDate: employee.dateOfJoining.toLocaleDateString(),
            shiftStart: formatTime(employee.shiftStart),
            shiftEnd: formatTime(employee.shiftEnd),
            timezone: employee.timezone,
            reportingName: 'Your Manager',
            reportingDesignation: 'Manager',
            organizationName : organization.name ,
            organizationWebsite: organization.website,
            organizationEmail: organization.email
        };
        const template = generateTemplate(html, data);

        if(true){
            const info = await transporter.sendMail({
                from: `"Clikkle Hr"<hr@clikkle.com> `, // sender address
                to: employee.email, // list of receivers
                subject: `Welcome to the ${organization.name} communication Team!`,
                html: template, // html body
            });
        }else {  
        const info = await sendSESEmail({
            from:    organization.email ,//`"${organization.name} Employment"<hr@clikkle.com>`,
            to: employee.email,
            subject: `Welcome to the ${organization.name} communication Team!`,
            html: template,
        });
    }

       
    } catch (err) {
        console.error(err);
    }
}
