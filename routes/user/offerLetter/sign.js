import JobApplication from '../../../schema/JobApplication.js';
import OfferLetter from '../../../schema/OfferLetter.js';

export default async function (req, res, next) {
    try {
        const userId = req.user.id;
        const sign = req.body.sign;
        const orgId = req.body.orgId;

        if (!sign) Error.throw('Signature is required');
           const jobApplication = await JobApplication.findOne({ userId ,adminId:orgId}).sort({ createdAt: -1 });
          if (!jobApplication)
            return Error.throw('We were unable to locate your job application.', 404);
        
        const letter = await OfferLetter.findOne({
            userId,
            jobApplicationId:jobApplication?._id,
            candidateSign: null,
        });

        if (!letter) Error.throw('Could not find a OfferLetter');

        letter.candidateSign.sign = sign;
        letter.candidateSign.time = new Date();

        await letter.save();

        res.success({ letter });
    } catch (e) {
        next(e);
    }
}
