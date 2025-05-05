import Agreement from '../../../schema/Agreement.js';
import JobApplication from '../../../schema/JobApplication.js';
import JobListing from '../../../schema/JobListing.js';

export default async function (req, res, next) {
    try {
        const { userId } = req.params;

        if (!userId) Error.throw('userId must be provided');

        const jobApplication = await JobApplication.findOne({ userId });
        const jobListing = await JobListing.findById(jobApplication.jobId);

        const agreement = new Agreement({
            jobId: jobListing.id,
            jobApplicationId: jobApplication.id,
            userId,
            nameOfEmployee: jobApplication.fullName,
            addressOfEmployee: '',
            benefits: getBenefits(jobListing),
            responsibilities: getResponsibilities(jobListing),
            salary: jobListing.salary,
            employmentContract: {
                employer: {
                    sign: 'Areeb Ahmad',
                    time: new Date(),
                },
            },
            nonDisclosure: {
                employer: {
                    sign: 'Areeb Ahmad',
                    time: new Date(),
                },
            },
            intellectualProperty: {
                employer: {
                    sign: 'Areeb Ahmad',
                    time: new Date(),
                },
            },
        });

        await agreement.validate();

        res.success({
            agreement,
        });
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

    Error.throw('No Benefits found in Job Description');
}

function getResponsibilities(jobListing) {
    const responsibilities = [];
    let recording = false;

    for (const detail of jobListing.details) {
        if (recording) {
            if (detail.tag === 'li') responsibilities.push(detail.content);
            else return responsibilities;
        } else if (detail.content === 'Key Responsibilities') {
            recording = true;
        }
    }

    Error.throw('No Responsibilities found in Job Description');
}
