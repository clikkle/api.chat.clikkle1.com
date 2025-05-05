import Docs from '../../../schema/Docs.js';
import { deleteImageFromHtml } from '../../../utils/functions.js';

export default async function (req, res, next) {
    try {
        const id = req.params.docId;

        if (!id) Error.throw('Id must be provided to delete');

        const doc = await Docs.findOne({ _id: id });

        deleteImageFromHtml(doc.content, doc.filenames);

        const updated = await doc.deleteOne();

        // if (!updated.acknowledged) Error.throw('Something went wrong, cannot delete doc', 500);

        res.success('Doc deleted successfully');
    } catch (err) {
        next(err);
    }
}
