import mongoose from 'mongoose';
import JobApplication from '../../../schema/JobApplication.js';
import JobListing from '../../../schema/JobListing.js';
import User from '../../../schema/User.js';
import FileHandler from '../../../classes/FileHandler.js';
import {  generateTemplate, getUserDetails } from '../../../utils/functions.js';
import {sendSESEmail } from '../../../libs/sendEmailSES.js';
import transporter from '../../../libs/nodemailer.js';
import fs from 'fs';
import Organization from '../../../schema/organization.js';

export default async function (req, res, next) {
    let photo, resume;
    const file = new FileHandler();
 
    try {
        const { experience, countryCode, linkedinAccount, jobId, phone  } = req.body;

        if (!req.files) Error.throw('Photo and Resume must be provided');

        if (!req.files.photo) Error.throw('Photo must be provided');
        photo = req.files.photo[0];

        if (!req.files.resume) Error.throw('Resume must be provided');
        resume = req.files.resume[0];

        const job = await JobListing.findById(jobId);
        const currentOrganization = await Organization.findById(job.adminId);
        const userId = req.user.id ;
        let user  = await getUserDetails(userId);
        const exists = await JobApplication.countDocuments({ jobId : jobId , userId: user._id });    
        if (exists){
             Error.throw(
                `You've already submitted your application. Please remain patient while it's being reviewed for shortlisting.`
            ,403);
        }
        console.log("phone", phone);

        const jobApplication = new JobApplication({
            fullName: (user?.firstName + " " +user?.lastName ),
            resume: resume.filename,
            jobTitle: job.title,
            experience,
            email: user?.recoveryEmail,
            countryCode,
            phone,
            linkedinAccount,
            photo: photo.filename,
            jobId,
            userId: user._id,
            adminId: job.adminId,
            agreements: [],
        });

        await jobApplication.save();

        // acceptFiles(photo, resume);

       

        res.status(200).json({
            message: 'Applied successfully',
            jobApplication,
        });
         sendEmail(jobApplication , currentOrganization);
    } catch (e) {
        if (photo) file.deleteFiles(photo.filename);
        if (resume) file.deleteFiles(resume.filename);
        next(e);
    }
}

async function sendEmail(jobApplication , organization) {
    try {
        const date = new Date();
        const dateNow = new Date().toLocaleDateString();
        const currentYear = date.getFullYear();
        const html = fs.readFileSync('templates/email/applicationClient.html', {
            encoding: 'utf-8',
        });

        const data = {
            name: jobApplication.fullName,
            jobTitle: jobApplication.jobTitle,
            email: jobApplication.email,
            phone: jobApplication.phone,
            date: dateNow,
            companyEmail: organization.email,
            currentYear,
            organizationName : organization.name ,
            organizationWebsite: organization.website,
            organizationEmail: organization.email
        };

        const template = generateTemplate(html, data);

        if(true){
            const info = await transporter.sendMail({
                from: `"Clikkle Hr"<hr@clikkle.com> `, // sender address
                to: jobApplication.email, // list of receivers
                subject: `Job Application received for ${jobApplication.jobTitle}`, // Subject line
                html: template, // html body
            });
            console.log('Email sent successfully ', info.messageId);
        }else {
        const info = await sendSESEmail({
            from:  organization.email, //`"${organizationName} Careers"<hr@clikkle.com>`, // sender address
            to: jobApplication.email, // list of receivers
            subject: `Job Application received for ${jobApplication.jobTitle}`, // Subject line
            html: template, // html body
        });
    }

        // 
    } catch (err) {
        console.error(err);
    }
}
