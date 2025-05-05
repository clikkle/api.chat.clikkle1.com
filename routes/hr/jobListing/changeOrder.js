import JobListing from '../../../schema/JobListing.js';

export default async function (req, res, next) {
    try {
        const { newOrders } = req.body;

        const query = newOrders.map(order => ({
            updateOne: {
                filter: { _id: order.id },
                update: { order: order.index },
            },
        }));

        const result = await JobListing.bulkWrite(query);

        res.success('Order changed successfully');
    } catch (e) {
        next(e);
    }
}
