import organizationSchema from '../../../schema/organization.js';
import subscriptionSchema from '../../../schema/Subscription.js';
import EmployeeSchema from '../../../schema/Employee.js';


export default async function (organization) {
    try {
        let subscription = await subscriptionSchema.findById(organization.subscription);
 
        if (!subscription) {
            return { success: false, message: "No subscription found" };
        }

        let maxEmployee = Number(subscription.maxEmployee);

        // If the subscription has unlimited employee access
        if (maxEmployee === -1) {
            return { success: true, message: "Subscription has unlimited employee access" };
        }

        // Find organizations under the same subscription
        let subscriptionOrganizations = await organizationSchema.find({ subscription: organization.userId });
        let adminIds = subscriptionOrganizations.map(org => org._id);

        // Count total employees under this subscription
        const employees = await EmployeeSchema.find({ adminId: { $in: adminIds } });

        // Check if the maximum number of employees is reached
        if (employees.length < maxEmployee) {
            return { success: true, message: "Employee can be added" };
        }

        // If the employee limit is reached, return a message to upgrade
        return {
            success: false,
            message: "You have reached the maximum number of employees allowed under your current subscription plan. Please upgrade your plan to add more employees."
        };

    } catch (err) {
        return { success: false, message: "Internal server error" };
    }
}