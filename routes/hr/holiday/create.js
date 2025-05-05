import { DateTime } from 'luxon';
import Holiday from '../../../schema/Holiday.js';

export default async function (req, res, next) {
    try {
        const { title , from , to} = req.body; // Assuming adminId is provided in the request body
       

        if (!(from.year && from.month && from.day && to.year && to.month && to.day)) Error.throw('Invalid date');

        const holiday = new Holiday({
            title,
            to: DateTime.utc(to.year, to.month, to.day),
            from: DateTime.utc(from.year, from.month, from.day),
           adminId:req.orgId ,
            // Assign the adminId to the holiday object
        });

        await holiday.save();

        res.success('Holiday added successfully');
    } catch (err) {
        next(err);
    }
}
