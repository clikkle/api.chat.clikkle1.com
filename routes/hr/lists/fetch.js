import List from '../../../schema/List.js';

export default async function (req, res, next) {
    try {
        const name = req.params.name;
        const adminId =  req.orgId;
        const list = await List.findOne({ name ,adminId });

        res.success({
            list,
        });
    } catch (err) {
        next(err);
    }
}
