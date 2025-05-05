// import JobListing from '../../../schema/JobListing.js';
// import { getCache } from "../../../libs/cacheStore.js";

// export default async function (req, res, next) {
//     console.log("function call")
//     try {
//         const orgId = req.orgId ; 
//      console.log("OrgIdVal", orgId);
//         if(req.orgId){
//             const { title, department, location, experience, details, jobType, salary, remote } = req.body; // Assuming adminId is included in the request body

//             const highestOrder = await JobListing.aggregate([
//                 {
//                     $group: {
//                         _id: null,
//                         order: { $max: '$order' },
//                     },
//                 },
//             ]);
    
    
//             const job = new JobListing({
//                 title,
//                 department,
//                 location,
//                 experience,
//                 details,
//                 jobType,
//                 salary,
//                 remote,
//                 adminId: orgId, 
//                 order: highestOrder[0]?.order + 1 || 1,
//             });
    
//             await job.save();
    
//             res.success({
//                 message: 'Job created successfully',
//                 job,
//             });
//         }
//         else{
//             console.log("adminId not match")
//         }
      
//     } catch (e) {
//         next(e);
//     }
// }
import JobListing from '../../../schema/JobListing.js';
export default async function (req, res, next) {
    try {
        const orgId = req.orgId;

        if (orgId) {
            const { title, department, location, experience, details, jobType, salary, remote } = req.body; // Assuming adminId is included in the request body

            // Check the highest order value for this adminId (orgId)
            const highestOrder = await JobListing.aggregate([
                {
                    $match: { adminId: orgId } // Match only jobs for this specific organization
                },
                {
                    $group: {
                        _id: null,
                        order: { $max: '$order' }, // Find the max order value
                    },
                },
            ]);

            const newOrder = (highestOrder[0]?.order || 0) + 1;

            const job = new JobListing({
                title,
                department,
                location,
                experience,
                details,
                jobType,
                salary,
                remote,
                adminId: orgId, // Save the orgId (adminId) as the reference
                order: newOrder, // Increment order for each new job
            });

            await job.save();

            res.success({
                message: 'Job created successfully',
                job,
            });
        } else {
            console.log("orgId not provided");
            res.status(400).json({
                error: 'Organization ID is required to create a job'
            });
        }

    } catch (e) {
        next(e);
    }
}
