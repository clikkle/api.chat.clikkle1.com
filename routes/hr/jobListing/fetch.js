// import { Types } from "mongoose";
// import DataSource from "../../../classes/DataSource.js";
// import JobListing from "../../../schema/JobListing.js";
// import { getCache } from "../../../libs/cacheStore.js";

// export default async function (req, res, next) {
//   try {
 
//     const orgId = req.orgId ; 
//     const id = req.params.id;
//     const department = req.query.department;

//     if (id) {
//       // Fetch job by id
//       const job = await JobListing.findById(id);
//       if (job && job.adminId.toString() === orgId.toString()) {
//         return res.success({ job });
//       } else {
//         return res.error("Job not found or unauthorized.");
//       }
//     }

//     if (department) {
//       req.query.department =  new Types.ObjectId(department);
//     }

//     // Fetch jobs by adminId and optional department
//     const dataSource = new DataSource(JobListing, req.query, ['department']);
//     const jobs = await dataSource.find({ adminId: new Types.ObjectId(orgId)   });

    

//     res.success({
//       jobs,
//       pageData: {
//         totalPages: 1, // Assuming all data fits on one page
//         totalData: jobs.length,
//         currentPage: 1,
//         pageSize: jobs.length, // Assuming all data fits on one page
//       },
//     });
//   } catch (e) {
//     next(e);
//   }
// }
import { Types } from "mongoose";
import DataSource from "../../../classes/DataSource.js";
import JobListing from "../../../schema/JobListing.js";

export default async function (req, res, next) {
  try {
    const orgId = req.orgId;
    const id = req.params.id;
    const department = req.query.department;

    if (id) {
      // Fetch job by id
      const job = await JobListing.findById(id);
      if (job && job.adminId.toString() === orgId.toString()) {
        return res.success({ job });
      } else {
        return res.error("Job not found or unauthorized.");
      }
    }

    if (department) {
      req.query.department = new Types.ObjectId(department);
    }

    // Pagination setup
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    req.query.pageSize = limit;
    // Fetch jobs with pagination
    const dataSource = new DataSource(JobListing, req.query, ['department']);
    const jobs = await dataSource.find({ adminId: new Types.ObjectId(orgId) })
      //.skip(skip)
      //.limit(limit);

    // Get total count of jobs
    const totalJobs = await JobListing.countDocuments({ adminId: new Types.ObjectId(orgId) });
    const totalPages = Math.ceil(totalJobs / limit);

    res.success({
      jobs,
      pageData: {
        totalPages: totalPages,
        totalData: totalJobs,
        currentPage: page,
        pageSize: jobs.length,
      },
    });
  } catch (e) {
    next(e);
  }
}

