import Memo from '../../../schema/Memo.js';

export default async function (req, res, next) {
    try {
        const memoId = req.params.memoId;
        const { title, description, departmentIds } = req.body;
       
        if (!memoId) Error.throw('Memo ID must be provided');

        const memo = await Memo.updateOne(
            { _id: memoId },
            { title, description, departmentIds }
        );

        if (memo.matchedCount === 0) Error.throw('No Memo found by id ' + memoId);

        if (memo.modifiedCount === 0) return res.success('No changes made in memo');

        res.success('Memo updated successfully');
    } catch (err) {
        next(err);
    }
}
