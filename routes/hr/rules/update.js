import Rules from '../../../schema/Rules.js';

export default async function (req, res, next) {
    try {
        const ruleId = req.params.ruleId;
        const { title, description, departmentIds } = req.body;

        if (!ruleId) Error.throw('Rule ID must be provided');

        const rule = await Rules.updateOne({ _id: ruleId }, { title, description, departmentIds });

        if (rule.matchedCount === 0) Error.throw('No Rule and Regulations found by id ' + ruleId);

        if (rule.modifiedCount === 0)
            return res.success('No changes made in rules and regulations');

        res.success('Rule updated successfully');
    } catch (err) {
        next(err);
    }
}
