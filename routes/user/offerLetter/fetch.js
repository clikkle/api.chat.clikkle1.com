import OfferLetter from '../../../schema/OfferLetter.js';
import JobListingSchema from "../../../schema/JobListing.js";
import OrganizationSchema from  "../../../schema/organization.js";
import JobApplication from '../../../schema/JobApplication.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;

        const jobApplication = await JobApplication.findOne({ userId ,adminId:req.query.orgId}).sort({ createdAt: -1 });
          if (!jobApplication)
            return Error.throw('We were unable to locate your job application.', 404);
        
        const letter = await OfferLetter.findOne({ jobApplicationId:jobApplication?._id});
        let  organization  ={};
        organization = await OrganizationSchema.findById(jobApplication?.adminId);
        // if(letter && letter.jobId){
        // const  jobListing  =  await JobListingSchema.findById(letter.jobId);
        // if(jobListing && jobListing.adminId){
        //  organization = await OrganizationSchema.findById(jobListing.adminId);
        // }
        // }
        res.success({ letter , organization});
    } catch (e) {
        next(e);
    }
}
