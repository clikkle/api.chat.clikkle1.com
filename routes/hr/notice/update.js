import Notice from '../../../schema/Notice.js';

export default async function (req, res, next) {
    try {
        const noticeId = req.params.noticeId;
        const { title, content, departmentIds, status } = req.body;
       
        if (!noticeId) Error.throw('Notice ID must be provided');

        const notice = await Notice.updateOne(
            { _id: noticeId },
            { title, content, status, departmentIds }
        );

        if (notice.matchedCount === 0) Error.throw('No Notice found by id ' + noticeId);

        if (notice.modifiedCount === 0) return res.success('No changes made in notice');

        res.success('Notice updated successfully');
    } catch (err) {
        next(err);
    }
}
