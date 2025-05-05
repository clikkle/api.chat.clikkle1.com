import User from '../../schema/User.js';

export default async function (req, res, next) {
    const { id } = req.user;

    try {
        const user = await User.findById(id);

        user.removeSensitiveInfo();

        res.success({
            user,
        });
    } catch (e) {
        next(e);
    }
}
