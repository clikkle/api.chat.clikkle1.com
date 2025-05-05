import JobApplication from '../../../schema/JobApplication.js';
import { generateTemplate, getOrganization } from '../../../utils/functions.js';
import { sendSESEmail } from '../../../libs/sendEmailSES.js';
import transporter from '../../../libs/nodemailer.js';

import fs from 'fs';

export default async function (req, res, next) {
    try {
        const applicationId = req.params.id;
        const { agreements } = req.body;

        if (!applicationId) Error.throw('Application Id must be provided');

        let agreementIdsArray = agreements.map(agr => agr.agreementId)
        const jobApplication = await JobApplication.findById({
            _id: applicationId,
            agreements: { $elemMatch: { agreementId: { $in: agreementIdsArray } } },
        });

        if (!jobApplication) Error.throw('This agreement is already sent to the applicant', 409);



        await JobApplication.updateOne(
            { _id: applicationId },
            {
                $push: {
                    agreements: {
                        $each: agreements
                    }
                },
                $set: { step: 3 }
            }
        );
        let organization = await getOrganization(req.orgId)
        sendEmail(jobApplication, organization);

        res.success({
            message: 'Agreement sent successfully',
        });
    } catch (e) {
        next(e);
    }
}

async function sendEmail(jobApplication, organization) {
    try {
        const currentYear = new Date().getFullYear();
        const html = fs.readFileSync('templates/email/agreementEmployee.html', {
            encoding: 'utf-8',
        });

        const data = {
            name: jobApplication.fullName,
            jobTitle: jobApplication.jobTitle,
            email: jobApplication.email,
            phone: jobApplication.phone,
            date: new Date(jobApplication.createdAt).toLocaleDateString(),
            currentYear,
            organizationName: organization.name,
            organizationWebsite: organization.website,
            organizationEmail: organization.email
        };

        const template = generateTemplate(html, data);

        if (true) {
            const info = await transporter.sendMail({
                from: `"Clikkle Hr"<hr@clikkle.com> `, // sender address
                to: jobApplication.email, // list of receivers
                subject: `Employment Agreement - ${organization.name}  `, // Subject line
                html: template, // html body
            });
            console.log('Email sent successfully ', info.messageId);
        } else {
            const info = await sendSESEmail({
                from: organization.email,  // `"${organization.name} Agreement"<hr@clikkle.com> `, // sender address
                to: jobApplication.email, // list of receivers
                subject: `Employment Agreement - ${organization.name}  `, // Subject line
                html: template, // html body
            });
        }
    } catch (err) {
        console.error(err);
    }
}
