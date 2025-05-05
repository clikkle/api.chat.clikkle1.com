import JobApplication from '../../../schema/JobApplication.js';
import Question from '../../../schema/Question.js';
import fs from 'fs';
import { sendSESEmail } from '../../../libs/sendEmailSES.js';
import { generateTemplate, getOrganization } from '../../../utils/functions.js';
import transporter from '../../../libs/nodemailer.js';

export default async function (req, res, next) {
    try {
      
        const { jobId, userId, interviewDate, interviewTime, interviewPlatform,oid } = req.body;

        if (!userId) Error.throw('userId must be provided');
        const jobApplication = await JobApplication.findOne({ _id: oid }); /// need  to fix
        const questionExists = await Question.count({ jobId:jobId });

        if (!questionExists)
            Error.throw(
                `No interview question found for ${jobApplication.jobTitle}. Kindly create the question then schedule the interview`
            );

        jobApplication.step = 1;
        jobApplication.interview = {
            date: interviewDate,
            time: interviewTime,
            platform: interviewPlatform,
        };

        let organization = await getOrganization(req.orgId)

        sendEmail(jobApplication, interviewDate, interviewTime, interviewPlatform, organization);

        await jobApplication.save();

        res.success({
            message: 'Interview Send successfully',
        });
    } catch (e) {
        next(e);
    }
}

async function sendEmail(jobApplication, interviewDate, interviewTime, interviewPlatform, organization) {
    try {
        const currentYear = new Date().getFullYear();
        const html = fs.readFileSync('templates/email/interviewEmployee.html', {
            encoding: 'utf-8',
        });

        const data = {
            name: jobApplication.fullName,
            jobTitle: jobApplication.jobTitle,
            email: jobApplication.email,
            phone: jobApplication.phone,
            date: new Date(jobApplication.createdAt).toLocaleDateString(),
            currentYear,
            interviewDate,
            interviewTime,
            interviewPlatform,
            organizationName: organization.name,
            organizationWebsite: organization.website,
            organizationEmail: organization.email
        };

        const template = generateTemplate(html, data);

        if (true) {

            const info = await transporter.sendMail({
                from: `"Clikkle Hr"<hr@clikkle.com> `, // sender address
                to: jobApplication.email, // list of receivers
                subject: `Interview invitation from ${organization.name}`, // Subject line
                html: template, // html body
            });
            console.log('Email sent successfully ', info.messageId);
        } else {
            const info = await sendSESEmail({
                from: organization.email,//`"${organization.name} Employment"<hr@clikkle.com>`, // sender address
                to: jobApplication.email, // list of receivers
                subject: `Interview invitation from ${organization.name}`, // Subject line
                html: template, // html body
            });
        }

        // 
    } catch (err) {
        console.error(err);
    }
}
