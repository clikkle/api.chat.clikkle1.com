import Department from '../../../schema/Department.js';
import { getCache } from "../../../libs/cacheStore.js";

export default async function (req, res, next) {
    try {
        const { name } = req.body;
        
        const department = new Department({
            name,
            adminId:req.orgId ,
        });

        await department.save(); 

        res.success({
            message: 'Department created successfully',
        });
    } catch (err) {
        next(err);
    }
}
