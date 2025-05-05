import Agreement from '../../../schema/Agreement.js';
import Answer from '../../../schema/Answer.js';
import Employee from '../../../schema/Employee.js';
import Application from '../../../schema/JobApplication.js';
import OfferLetter from '../../../schema/OfferLetter.js';
import { deleteFilesFromAWS } from '../../../utils/functions.js';

export default async function (req, res, next) {
    try {
        const id = req.params.id;
console.log(req.user,"REQ USER  SSSS")
        if (!id) {
            Error.throw('JobApplication must be specified');
        }

        const application = await Application.findById(id);

        console.log(application,"applicationapplication")
        if (!application) {
            Error.throw('No Application found for id ' + id);
        }

        if (application.step === 4) {
            Error.throw("Can't reset the application because the applicant is an employee.");
        }
        
        await Answer.deleteOne({ userId: application.userId , jobId:application?.jobId});

        await OfferLetter.deleteOne({ userId: application.userId , jobApplicationId:application?._id });

        // await Employee.deleteOne({ _id: application.userId });

        application.step = 0;
        application.agreements = [];
        application.status = 'Pending';
        await application.save();
        return res.success('Application reset successfully');
    } catch (e) {
        next(e);
    }
}
