import FileHandler from '../../../classes/FileHandler.js';
import Docs from '../../../schema/Docs.js';
import { replaceImageSrc, updateImageHtml } from '../../../utils/functions.js';

export default async function (req, res, next) {
    let html = null;
    let newFiles = null;

    try {
        const docId = req.params.docId;
        const { jobIds, content, title } = req.body;

        if (!docId) Error.throw('docId must be provided');

        const docs = await Docs.findById(docId);

        const file = new FileHandler();

        updateImageHtml(content, docs.filenames);
        const files = file.decodeBase64Html(content);

        if (files.length) {
            html = replaceImageSrc(content, files);
            newFiles = [...docs.filenames, ...files];
        }

        docs.content = html || content;
        docs.jobIds = jobIds;
        docs.title = title;
        docs.filenames = newFiles || docs.filenames;

        await docs.save();

        res.success('Docs saved successfully');
    } catch (err) {
        next(err);
    }
}
