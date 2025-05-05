import Employee from '../../../schema/Employee.js';
import JobApplication from '../../../schema/JobApplication.js';
import JobListing from '../../../schema/JobListing.js';
import {sendSESEmail } from '../../../libs/sendEmailSES.js';
import { generateTemplate, getOrganization } from '../../../utils/functions.js';
import transporter from '../../../libs/nodemailer.js';
import fs from 'fs';

export default async function (req, res, next) {
    try {
        const { employeeId } = req.params;
        const { reason , employeeStatus} = req.body;

        if (!employeeId) Error.throw('Field `Employee Id` is required ');
        if (!reason?.trim()) Error.throw('Field `reason` is required ');

        const employee = await Employee.findById(employeeId);
        const jobApplication = await JobApplication.findOne({ userId: employeeId }).sort({createdAt:-1});
        const designation = await JobListing.findById(employee.designation);

        if (!employee) Error.throw('No employee found to terminate', 404);

        if(employee)
        {
            employee.status = employeeStatus == "terminated" ? 'Terminated' : "Active";
        }
      
        // employee.status ='Terminated';
      
        jobApplication.status = employeeStatus == "terminated"  ? 'Terminated' : "Employed";

        await employee.save();
        await jobApplication.save();
        let  organization = await getOrganization(req.orgId)
        if(employeeStatus == "terminated")
        {
            sendEmail(employee, designation.title, reason ,organization);
        }

        res.success(`Employee status updated successfully!`);
    } catch (err) {
        next(err);
    }
}

async function sendEmail(employee, designation, reason ,organization) {
    try {
        const currentYear = new Date().getFullYear();
        const html = fs.readFileSync('templates/email/terminateEmployee.html', {
            encoding: 'utf-8',
        });

        const data = {
            name: employee.firstName + ' ' + employee.lastName,
            jobTitle: designation,
            currentYear,
            joiningDate: employee.dateOfJoining.toLocaleDateString(),
            reason,
            organizationName : organization.name ,
            organizationWebsite: organization.website,
            organizationEmail: organization.email
        };

        const template = generateTemplate(html, data);

        if(true){
        const info = await transporter.sendMail({
            from: `"Clikkle Hr"<hr@clikkle.com> `, // sender address
            to: employee.email, // list of receivers
            subject: 'Termination of Employment with Clikkle', // Subject line
            html: template, // html body
        });
        console.log('Email sent successfully ', info.messageId);
        }else {
            const info = await sendSESEmail({
                from: 'hr@clikkle.com', // sender address
                to: employee.email, // list of receivers
                subject: 'Termination of Employment with Clikkle', // Subject line
                html: template, // html body
            });
    
        }
    } catch (err) {
        console.error(err);
    }
}
