import Rules from '../../../schema/Rules.js';

export default async function (req, res, next) {
    try {
        const { departmentIds, description, title } = req.body;
    
        const rules = new Rules({
            title,
            description,
            departmentIds,
            adminId:req.orgId,
        });

        await rules.save();

        res.success('Rules and Regulations created successfully');
        
    } catch (err) {
        next(err);
    }
}
