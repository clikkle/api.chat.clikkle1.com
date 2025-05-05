import Rules from '../../../schema/Rules.js';

export default async function (req, res, next) {
    try {
        const id = req.params.ruleId;

        if (!id) Error.throw('Id must be provided to delete');

        await Rules.deleteOne({ _id: id });

        res.success('Rules deleted successfully');
    } catch (err) {
        next(err);
    }
}
