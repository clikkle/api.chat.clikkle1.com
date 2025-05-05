import OfferLetter from '../../../schema/OfferLetter.js';
import JobApplication from '../../../schema/JobApplication.js';
import JobListing from '../../../schema/JobListing.js';
import { generateTemplate, getOrganization } from '../../../utils/functions.js';
import {sendSESEmail } from '../../../libs/sendEmailSES.js';
import transporter from '../../../libs/nodemailer.js';
import fs from 'fs';

export default async function (req, res, next) {
    try {
        const {
            userId,
            jobTitle,
            nameOfEmployee,
            jobDescription,
            team,
            manager,
            salary,
            jobApplicationId,
            //Trainingbonus,
            hrSign,
        } = req.body;

        if (!userId) Error.throw('userId must be provided');

        const jobApplication = await JobApplication.findById(jobApplicationId);
        const jobListing = await JobListing.findById(jobApplication.jobId);
       
        let offerLetter = await OfferLetter.findOne({jobApplicationId:jobApplicationId});
if(!offerLetter){
 offerLetter = new OfferLetter({
        jobId: jobListing.id,
        jobApplicationId: jobApplication.id,
        userId:jobApplication.userId,
        jobTitle,
        nameOfEmployee,
        jobDescription,
        probationaryPeriod: '3',
        manager,
        salary,
        team,
        benefits: getBenefits(jobListing),
        allowance: ['Gym Allowance', 'Phone Allowance', 'Travel Allowance'],
        daysOff: {
            vacation: '5-30',
            emergency: '7',
        },
        //TrainingBonus,
        noticePeriod: 14,
        effectiveDays: 5,
        hrSign,
    });
    jobApplication.step = 2;
    await jobApplication.save();
    await offerLetter.save();
}
        
        res.success({
            message: 'Offer letter created successfully',
            offerLetter,
        });
        let organization = await getOrganization(req.orgId)
        sendEmail(jobApplication ,organization);
    } catch (e) {
        next(e);
    }
}

function getBenefits(jobListing) {
    const benefits = [];
    let recording = false;

    for (const detail of jobListing.details) {
        if (recording) {
            if (detail.tag === 'li') benefits.push(detail.content);
            else return benefits;
        } else if (detail.content === 'Your Benefits') {
           recording = true;
        }
    }

    return 'Benefits';
    // Error.throw('No Benefits found in Job Description');
}

async function sendEmail(jobApplication , organization) {
    try {
        const currentYear = new Date().getFullYear();
        const html = fs.readFileSync('templates/email/offerLetter.html', {
            encoding: 'utf-8',
        });

        const data = {
            name: jobApplication.fullName,
            jobTitle: jobApplication.jobTitle,
            email: jobApplication.email,
            phone: jobApplication.phone,
            date: new Date(jobApplication.createdAt).toLocaleDateString(),
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
                subject: `${organization.name} offer letter`, // Subject line
                html: template, // html body
            });
            console.log('Email sent successfully ', info.messageId);
        }else {
        const info = await sendSESEmail({
            from: organization.email, //`"${organization.name} offer letter"<hr@clikkle.com>`, // sender address
            to: jobApplication.email, // list of receivers
            subject: `${organization.name} offer letter`, // Subject line
            html: template, // html body
        });
    }
        // 
    } catch (err) {
        console.error(err);
    }
}
