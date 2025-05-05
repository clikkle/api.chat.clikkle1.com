import axios from 'axios';
import Applications from '../../../schema/JobApplication.js';
import { getUserDetails, getUserProfile } from '../../../utils/functions.js';

export default function (action) {
    return async function (req, res, next) {
        try {
            const _id = req.params.id;
            const status = req.query.status;
            const user = req.user;
            const userId = req.user.id ;

            if (!_id) Error.throw('Application id must be provided');
            if (!status) Error.throw('status id must be provided');

            if (action === 'add') {
                const exists = await Applications.find({
                    _id,
                    'label.status': status,
                }).count();

                if (exists) return res.success('Status added successfully');

                const fetchUser = await getUserDetails(userId);

                await Applications.updateOne(
                    { _id },
                    {
                        $addToSet: {
                            label: {
                                status,
                                modifiedBy: `${fetchUser?.firstName} ${fetchUser?.lastName}`,
                            },
                        },
                    }
                );
                return res.success('Status added successfully');
            }
            if (action === 'remove') {
                await Applications.updateOne(
                    { _id, label: { $elemMatch: { status } } },
                    {
                        $pull: {
                            label: { status },
                        },
                    }
                );

                return res.success('Status removed successfully');
            }

            res.error('Unable to update the status');
        } catch (e) {
            next(e);
        }
    };
}
