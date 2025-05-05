import User from '../../schema/User.js';
import { filterObject } from '../../utilities/functions.js';

export default async function (req, res, next) {
    const { id } = req.user;
    const toUpdate = req.body;
    const updatesAllowed = ['firstName', 'lastName', 'gender', 'dob'];

    try {
        const user = await User.findById(id);

        if (!user) {
            Error.throw('No User Found', 404);
        }

        const updated = await user.updateOne({
            $set: filterObject(toUpdate, updatesAllowed),
        });

        const { acknowledged, modifiedCount } = updated;

        if (!acknowledged) {
            Error.throw('Something went wrong', 500);
        }

        res.success(
            modifiedCount ? 'User updated successfully' : 'No change in user'
        );
    } catch (e) {
        next(e);
    }
}
