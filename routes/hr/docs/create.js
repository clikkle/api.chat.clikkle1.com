import FileHandler from '../../../classes/FileHandler.js';
import Docs from '../../../schema/Docs.js';
import { replaceImageSrc } from '../../../utils/functions.js';

export default async function (req, res, next) {
    try {
        const { jobIds, content, title } = req.body;
        const adminId = req.orgId ;

        const file = new FileHandler();

        const filenames = file.decodeBase64Html(content);
        const html = replaceImageSrc(content, filenames);

        const docs = new Docs({
            title,
            content: html,
            jobIds,
            filenames,
            adminId 
        });

        await docs.save();

        res.success('Docs saved successfully');
    } catch (err) {
        next(err);
    }
}
