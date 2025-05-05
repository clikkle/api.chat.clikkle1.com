import List from '../../../schema/List.js';
import { getUserDetails } from '../../../utils/functions.js';

export default async function (req, res, next) {
    try {
        const { name, item } = req.body;
        // const user = req.user;
        const adminId =  req.orgId;

        const userId = req.user.id ;
        let user  = await getUserDetails(userId);



        // const result = await List.findOneAndUpdate(
        //     { name },
        //     {
        //         $addToSet: {
        //             items: {
        //                 value: item,
        //                 createdBy: `${user?.firstName} ${user?.lastName}`,
        //             },
        //         },
        //         adminId,
        //     },
        //     { upsert: true, new: true }
        // );

        const list = await List.findOne({ name  , adminId});
        if(list){

        const exists = list && list.items.some(i => i.value === item);
        if (exists) Error.throw('List item already exists');

         let result =  await List.updateOne(
            { name ,adminId },
            {
                $addToSet: {
                    items: {
                        value: item,
                        createdBy: `${user?.firstName} ${user?.lastName}`,
                    },
                },
            },
            {
                upsert: true,new: true
            }
        );
    }else {

        const newList  = new List({
            adminId,
            name,
            items : [{
                value: item,
                createdBy: `${user?.firstName} ${user?.lastName}`,
            }]

        });

        await newList.save();
    }

        res.success('List-Item created successfully');
    } catch (err) {
        next(err);
    }
}
