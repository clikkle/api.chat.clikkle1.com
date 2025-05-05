import JobApplication from '../../../schema/JobApplication.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;

        const jobApplication = await JobApplication.findOne({ userId ,adminId:req.query.orgId}).sort({_id:-1});

        if (!jobApplication)
            return Error.throw('We were unable to locate your job application.', 404);
  if(jobApplication.status==="Terminated")
    jobApplication.step=0;

        res.success({ step: jobApplication.step });
    } catch (err) {
        next(err);
    }
}
