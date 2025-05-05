import User from '../../schema/User.js';
import { signToken } from '../../utils/functions.js';

export default async function login(req, res, next) {
    const { email, password } = req.body;

    try {
        const query = { email };

        const user = await User.findOne(query);

        if (!user) Error.throw('This Account Does Not Exist', 404);

        if (await user.isUnauthorized(password)) Error.throw('Email or Password is invalid', 200);

        user.removeSensitiveInfo();

        const token = signToken(user);

        res.success({
            user,
            token,
        });
    } catch (e) {
        next(e);
    }
}
