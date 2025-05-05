import User from '../../schema/User.js';
import { signToken } from '../../utils/functions.js';

export default async function (req, res, next) {
    try {
        const { firstName, lastName, dob, gender, email, password, phone, photo } = req.body;

        const user = new User({
            firstName,
            lastName,
            dob,
            gender,
            email,
            password,
            phone,
            photo,
        });

        await user.save();

        user.removeSensitiveInfo();

        const token = signToken(user);

        res.success({
            message: 'Account created successfully',
            user,
            token,
        });
    } catch (e) {
        console.log(e);
        next(e);
    }
}
