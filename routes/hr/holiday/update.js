import { DateTime } from 'luxon';
import Holiday from '../../../schema/Holiday.js';

export default async function (req, res, next) {
    try {
        const holidayId = req.params.id;
        const { title, date } = req.body;
        const { year, month, day } = date;

        if (!holidayId) Error.throw('Holiday Id must be provided');

        if (!(year && month && day)) Error.throw('Invalid date');

      
        const holiday = await Holiday.updateOne(
            { _id: holidayId },
            {
                title,
                date: DateTime.utc(year, month, day),
            }
        );

        if (holiday.matchedCount === 0) Error.throw('No holiday found by id ' + holidayId);

        if (holiday.modifiedCount === 0) return res.success('No changes made in holiday');

        res.success('Holiday update successfully');
    } catch (err) {
        next(err);
    }
}
