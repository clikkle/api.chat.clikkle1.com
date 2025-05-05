import Memo from '../../../schema/Memo.js';

export default async function (req, res, next) {
    try {
        const id = req.params.memoId;

        if (!id) Error.throw('Id must be provided to delete');

        await Memo.deleteOne({ _id: id });

        res.success('Memo deleted successfully');
    } catch (err) {
        next(err);
    }
}
