import FileHandler from '../../../classes/FileHandler.js';
import Application from '../../../schema/JobApplication.js';
import OfferLetter from '../../../schema/OfferLetter.js';
import { deleteFilesFromAWS } from '../../../utils/functions.js';

export default async function (req, res, next) {
    try {
        const id = req.params.id;

        if (!id) {
            Error.throw('JobApplication must be specified');
        }

        const application = await Application.findById(id);

        if (!application) {
            Error.throw('No Application found for id ' + id);
        }

        const offerLetter = await OfferLetter.findOne({
            userId: application.userId,
            jobApplicationId: application._id
        });

        // if (Boolean(offerLetter))
        //     Error.throw('Cannot delete the application as offerLetter is sent already');

        const file = new FileHandler();

        file.deleteFiles(application.resume, application.photo);

        // await deleteFilesFromAWS(files);
        if (Boolean(offerLetter))
            await offerLetter.deleteOne();
        await application.deleteOne();

        return res.success('Application deleted successfully');
    } catch (e) {
        next(e);
    }
}
