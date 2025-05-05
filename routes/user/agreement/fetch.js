import JobApplication from '../../../schema/JobApplication.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;
        const application = await JobApplication.findOne({ userId ,adminId:req.query.orgId}).sort({_id:-1});
       
        if (!application)
            return Error.throw('We were unable to locate your job application.', 404);
        
       
        res.success({ agreements: application.agreements });
    } catch (e) {
        next(e);
    }
}
