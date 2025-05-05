import List from '../../../schema/List.js';

export default async function (req, res, next) {
    try {
        // const itemId = req.params.name;

        // await List.deleteOne({ _id: itemId });

        return res.success('This route is under construction');
    } catch (err) {
        next(err);
    }
}
