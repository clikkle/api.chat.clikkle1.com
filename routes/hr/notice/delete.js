import Notice from '../../../schema/Notice.js';

export default async function (req, res, next) {
    try {
        const id = req.params.noticeId;

        if (!id) Error.throw('Id must be provided to delete');

        await Notice.deleteOne({ _id: id });

        res.success('Notice deleted successfully');
    } catch (err) {
        next(err);
    }
}
