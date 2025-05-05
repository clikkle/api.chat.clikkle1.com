import Holiday from '../../../schema/Holiday.js';

export default async function (req, res, next) {
    try {
        const holidayId = req.params.id;

        await Holiday.findByIdAndDelete(holidayId);

        res.success('Holiday removed successfully');
    } catch (err) {
        next(err);
    }
}
