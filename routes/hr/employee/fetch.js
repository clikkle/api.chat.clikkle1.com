import Employee from '../../../schema/Employee.js';
import DataSource from '../../../classes/DataSource.js';
import { Types } from 'mongoose';
import mongoose, { connect, disconnect } from 'mongoose';
import { getCache } from '../../../libs/cacheStore.js';

export default async function (req, res, next) {
    try {
        const { employeeId } = req.params;
        const orgId = req.orgId;

       
        if (!orgId) {
            return res.status(400).json({ error: 'Organization ID not found in cache' });
        }

       
        if (employeeId) {
            const [employee] = await Employee.aggregate([
                {
                    $match: {
                        adminId: new Types.ObjectId(orgId), // Ensure it matches orgId
                    },
                },
                {
                    $lookup: {
                        from: 'joblistings',
                        localField: 'designation',
                        foreignField: '_id',
                        as: 'designation',
                    },
                },
                {
                    $addFields: {
                        designation: { $arrayElemAt: ['$designation.title', 0] },
                    },
                },
            ]);

          
            if (!employee) {
                return res.status(404).json({ error: 'No Employee found for id ' + employeeId });
            }

            return res.success({
                employee,
            });
        }

        // const uriDB2 = process.env.MONGODB_ACCOUNT_CONNECTION;
        // const db2Connection = mongoose.createConnection(uriDB2, {
        //     useNewUrlParser: true,
        //     useUnifiedTopology: true,
        // });
        // const UserSchema = new mongoose.Schema({
        //     _id: mongoose.Schema.Types.ObjectId,
        //     firstName: String,
        //     email: String,
        //     userImage: String
        // });
        // const User = db2Connection.model('User', UserSchema);

        const dataSource = new DataSource(Employee, req.query);
        const employees = await dataSource.aggregate([
            {
                $match: {
                    adminId: new Types.ObjectId(orgId), // Ensure it matches orgId
                },
            },
            {
                $lookup: {
                    from: 'joblistings',
                    localField: 'designation',
                    foreignField: '_id',
                    as: 'designation',
                },
            },
            {
                $addFields: {
                    designation: { $arrayElemAt: ['$designation.title', 0] },
                },
            },
        ]);
        const employeeIds = employees.map((employee) => employee._id); 
        // const users = await User.find({ _id: { $in: employeeIds } });
        const combinedEmpData = employees.map(employee => {
            // const user = users.find((usr) => usr._id.toString() === employee._id.toString());
            // // employee.userImage = user.userImage;
            // employee.userImage = user ? user.userImage : null; 
            return employee
        });

        
        res.success({
            employees:combinedEmpData,
            pageData: dataSource.pageData,
        });
    } catch (err) {
        console.error("Error occurred:", err); // Debugging log
        next(err);
    }
}
