import Notice from '../../../schema/Notice.js';

export default async function (req, res, next) {
    try {
        const { departmentIds, content, status, title } = req.body;
        const notice = new Notice({
            title,
            content,
            departmentIds,
            status,
            adminId:req.orgId ,
        });

        await notice.save();

        res.success('Notice created successfully');
    } catch (err) {
        next(err);
    }
}
