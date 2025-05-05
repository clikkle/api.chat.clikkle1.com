import OfferLetter from '../../../schema/OfferLetter.js';
import JobApplication from '../../../schema/JobApplication.js';
import JobListing from '../../../schema/JobListing.js';
import OrganizationSchema from '../../../schema/organization.js';

export default async function (req, res, next) {
    try {
        const { jobApplicationId } = req.params;

        //if (!userId) Error.throw('userId must be provided');

        const jobApplication = await JobApplication.findOne({ _id:jobApplicationId })//.sort({createdAt: -1});
        const jobListing = await JobListing.findById(jobApplication.jobId);
         let  organization =  await OrganizationSchema.findById(jobListing.adminId);
 const userId=jobApplication.userId;
        //  organization.aboutCompany  = getAboutCompanyDescription(jobListing),

      
        const offerLetter = new OfferLetter({
            jobId: jobListing.id,
            jobApplicationId: jobApplication.id,
            userId,
            jobTitle: jobListing.title,
            nameOfEmployee: jobApplication.fullName,
            jobDescription: getJobDescription(jobListing),
            team: 'Development Team',
            probationaryPeriod: '3',
            manager: {
                name: 'George Miller',
                jobTitle: 'Head Of Development',
            },
            salary: jobListing.salary,
            benefits: getBenefits(jobListing),
            allowance: ['Gym Allowance', 'Phone Allowance', 'Travel Allowance'],
            daysOff: {
                vacation: '5-30',
                emergency: '7',
            },
            noticePeriod: 14,
            effectiveDays: 5,
            hrSign: 'George Miller',
        });

        await offerLetter.validate();

        res.success({
            offerLetter,
            organization 
        });
    } catch (e) {
        next(e);
    }
}

function getJobDescription(jobListing) {
    let i = 0;

    for (const detail of jobListing.details) {
        if (detail.content === 'Job Description') {
            return jobListing.details[i + 1].content.split(' ').slice(0, 40).join(' ');
        }

        i++;
    }

    return 'Job Description';
    // Error.throw('Job Description not found');
}
function getAboutCompanyDescription(jobListing) {
    let i = 0;

    for (const detail of jobListing.details) {
        if (detail.content === 'About Company') {
            return jobListing.details[i + 1].content.split(' ').slice(0, 40).join(' ');
        }

        i++;
    }

    return 'About Company';
    // Error.throw('Job Description not found');
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
