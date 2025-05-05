import User from '../../schema/User.js';

export default async function (req, res, next) {
    const { email } = req.body;

    try {
        const query = { email };

        const user = await User.findOne(query);

        if (!user) Error.throw('This Account Does Not Exist', 404);

        res.success();
    } catch (e) {
        next(e);
    }
}
