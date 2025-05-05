import OfferLetter from '../../../schema/OfferLetter.js';
import JobListingSchema from "../../../schema/JobListing.js";
import OrganizationSchema from  "../../../schema/organization.js";

export default async function (req, res, next) {
    try {
        const jobApplicationId = req.params.id;

        if (!jobApplicationId) Error.throw('Application Id must be provided');

        const letter = await OfferLetter.findOne({ jobApplicationId });

        if (!letter) return res.error('The offer letter may not be issued yet!');

        let  organization  ={};
        
        if(letter && letter.jobId){
        const  jobListing  =  await JobListingSchema.findById(letter.jobId);
        if(jobListing && jobListing.adminId){
         organization = await OrganizationSchema.findById(jobListing.adminId);
        }
        }

        res.success({ letter   ,  organization});
    } catch (e) {
        next(e);
    }
}
