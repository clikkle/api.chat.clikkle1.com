import Memo from '../../../schema/Memo.js';

export default async function (req, res, next) {
    try {
        const { departmentIds, description, title } = req.body;
        const notice = new Memo({
            title,
            description,
            departmentIds,
            adminId:req.orgId,
        });

        await notice.save();

        res.success('Memo created successfully');
    } catch (err) {
        next(err);
    }
}
