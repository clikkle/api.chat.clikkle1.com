import { DateTime, Info } from 'luxon';
import Employee from '../../../schema/Employee.js';
import User from '../../../schema/User.js';
import OfferLetter from '../../../schema/OfferLetter.js';
import JobApplication from '../../../schema/JobApplication.js';
import organizationSchema from '../../../schema/organization.js';
import subscriptionSchema from '../../../schema/Subscription.js';

import { formatTime, generateTemplate, getOrganization, getUserDetails } from '../../../utils/functions.js';
import JobListing from '../../../schema/JobListing.js';
import {sendSESEmail } from '../../../libs/sendEmailSES.js';
import transporter from '../../../libs/nodemailer.js';
import fs from 'fs';
import checkEmployeeLimit from './checkEmployeeLimit.js';

export default async function (req, res, next) {
    // console.log("function Call")
    try {
        const { userId, department, dateOfJoining, shiftStart, shiftEnd, timezone, jobType,jobId } = req.body;
        const adminId = req.orgId ;

        if (!userId || !adminId) Error.throw('User ID and admin ID must be provided');

        const offerLetter = await OfferLetter.findOne({
            //userId,
            jobApplicationId:jobId,

        });
        if (!offerLetter) Error.throw('No offerLetter found');

        if (!offerLetter.candidateSign.sign) Error.throw('OfferLetter must be signed');

        const jobApplication = await JobApplication.findById(offerLetter.jobApplicationId);

        const user = await getUserDetails(userId);

        if (!user) Error.throw('User Not Found ');

        if (!Info.isValidIANAZone(timezone)) Error.throw('Invalid timezone provided');

        let organization   = await organizationSchema.findById(adminId);
        
        // let checkMaxLimit    =  await checkEmployeeLimit(organization);

        // if(!checkMaxLimit?.success){
        //     Error.throw(checkMaxLimit.message);  
        // }
        const dateObj = new Date(dateOfJoining);

        const relativeDateOfJoining = DateTime.fromObject(
            {
                year: dateObj.getFullYear(),
                month: dateObj.getMonth() + 1,
                day: dateObj.getDate(),
            },
            { zone: timezone }
        );

        const designation = await JobListing.findById(jobApplication.jobId);

        const employee = new Employee({
            // _id: user._id,
            userId: userId,
            adminId:adminId, 
            firstName: jobApplication.fullName.split(' ')[0],
            lastName: jobApplication.fullName.split(' ').slice(1).join(' '),
            phone: {
                phone: jobApplication.phone,
                countryCode: jobApplication.countryCode,
            },
            dob: user.dob,
            gender: user.gender,
            email: jobApplication.email,
            department,
            designation: jobApplication.jobId,
            role: jobApplication.jobTitle,
            dateOfJoining: relativeDateOfJoining,
            salary: {
                currency: offerLetter.salary.currency,
                amount: offerLetter.salary.amount,
            },
            shiftStart,
            shiftEnd,
            timezone,
            jobType
        });
        jobApplication.step = 4;
        jobApplication.status = 'Employed';
        // user.role = 'employee';
         await employee.save();
         await jobApplication.save();
        // await user.save();

        res.success('Employee saved successfully');

        // let  organization =  await getOrganization(req.orgId)

        sendEmail(employee, designation, offerLetter , organization);
    } catch (err) {
        next(err);
    }
}

async function sendEmail(employee, designation, offerLetter , organization) {
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
            reportingName: offerLetter.manager.name,
            reportingDesignation: offerLetter.manager.jobTitle,
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
            console.log('Email sent successfully ', info.messageId);
        }else {
        const info = await sendSESEmail({
            from:organization.email, //`"${organization.name} Employment"<hr@clikkle.com> `, // sender address
            to: employee.email, // list of receivers
            subject: `Welcome to the ${organization.name} communication Team!`,
            html: template, // html body
        });
    }

        //
    } catch (err) {
        console.error(err);
    }
}
