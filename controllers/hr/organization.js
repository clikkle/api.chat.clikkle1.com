import express from 'express';
import Organization from '../../schema/organization.js';

import Employee from '../../schema/Employee.js';
import SubscriptionSchema from '../../schema/Subscription.js';
import { setCache } from '../../libs/cacheStore.js';
import upload from '../../libs/multer.js';
import FileHandler from '../../classes/FileHandler.js';
import { verifyEmailAddressSES } from '../../libs/sendEmailSES.js';
import Applications from '../../schema/JobApplication.js';

import { orgToken } from '../../utils/functions.js';
const organizationRouter = express.Router();

// Create a new organization
organizationRouter.post('/',   upload.fields([
    { name: 'photo', maxCount: 1 },
]), async (req, res) => {
    try {

        let photo;
        const file = new FileHandler()
        let userId = req.user.id;
        const { name , email,  website ,portalName,organizationSize,plan, industry} = req.body;

        if (!req.files) throw new Error('Photo and Resume must be provided');

        if (!req.files.photo) throw new Error('Photo must be provided');
        photo = req.files.photo[0];
        
        const UserSubscription = await SubscriptionSchema.findOne({ userId: userId,isActive:false })
        
        if (!UserSubscription) {
            //if (photo) file.deleteFiles(photo.filename);
        //     return res.status(403).json({
        //         success: false,
        //         error: "Subscription  not found ",
        //         data: {}
        //     })
         }

        const checkExisting = await Organization.find({ userId: userId })

        // if (checkExisting.length >= UserSubscription.maxOrganizations && UserSubscription.maxOrganizations != -1) {
        //     if (photo) file.deleteFiles(photo.filename);
        //     return res.status(403).json({
        //         success: false,
        //         error: "maximum Organization is created please upgrade plan",
        //         data: {}
        //     })
        // }

        if (checkExisting.find((item) => item.name == name)) {
            // if (photo) file.deleteFiles(photo.filename);
            return res.status(401).json({
                success: false,
                error: "Organization  Name is already exist",
                data: {}
            })
        }

        const organization = new Organization({ userId, subscription: userId, status: true, name , email,  website  , logo : photo.filename ,plan,portalName,industry ,organizationSize});
        await organization.save();

        //  need to add clickkle plus 
        if(false){
            let verifyMail =  verifyEmailAddressSES(email)
        }
        //file.acceptFiles([photo]);
        res.status(201).json({
            success: true,
            error: "",
            data: organization
        });
    } catch (error) {
        console.log(error,"ERROR")
        //if (photo) file.deleteFiles(photo.filename);
        res.status(500).json({
            success: false,
            error: "Internal Server Error",
            data: "",
        });

    }
});

// Upgrade Subscription
organizationRouter.post('/upgrade', async (req, res) => {
    try {
        const userId = req.user.id;
        const { newPlanId } = req.body; // Assume newPlanId represents the upgraded plan's ID

        // Find the user's current subscription
        const currentSubscription = await SubscriptionSchema.findOne({ userId, isActive: true });
        
        if (!currentSubscription) {
            return res.status(404).json({
                success: false,
                error: "No active subscription found",
                data: {}
            });
        }

        // Fetch the details of the new plan
        const newPlan = await SubscriptionSchema.findById(newPlanId);
        if (!newPlan) {
            return res.status(404).json({
                success: false,
                error: "Requested plan not found",
                data: {}
            });
        }

        
        currentSubscription.planId = newPlan._id;
        currentSubscription.maxOrganizations = newPlan.maxOrganizations; // Example: Update max organizations
        await currentSubscription.save();

        res.status(200).json({
            success: true,
            message: "Subscription upgraded successfully",
            data: currentSubscription
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal Server Error " + String(error?.message),
            data: "",
        });
    }
});


organizationRouter.post('/select', async (req, res) => {
 
    try {
        let userId = req.user.id;
        
        
        const { organizationId , organization } = req.body;
        const currentOrganization = await Organization.findById(organizationId).populate("subscription");
     
        if (!currentOrganization) {
            return res.status(404).json({
                success: false,
                error: " Organization no",
                data: {}
            })
        }else {

        if (!currentOrganization.status) {
            return res.status(404).json({
                success: false,
                error: "Organization is not active",
                data: {}
            })
        }else {

            const employee = await Employee.findOne({ userId:userId ,adminId:organizationId,status:"Active"});

            setCache(userId, organizationId);
            let orgKey = 'org-info-' + String(organizationId)
            setCache(orgKey , currentOrganization);
            const token =  orgToken(currentOrganization);
            return res.status(200).json({
                success: true,
                message: "Organization Session selected",
                data: token,
                employee:employee
            })   
}
       }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal Server Error " +String(error?.message),
            data: "",
        });

    }
});

organizationRouter.post('/check', async (req, res) => {
 
    try {
        let userId = req.user.id;
        
        
        const { organizationId , organization } = req.body;
        const currentOrganization = await Organization.findById(organizationId);
     
        if (!currentOrganization) {
            return res.status(404).json({
                success: false,
                error: "Not found Organization",
                data: {}
            })
        }else {

        if (!currentOrganization.status) {
            return res.status(404).json({
                success: false,
                error: "Organization is not active",
                data: {}
            })
        }else {
   
if(organization?.type == "Owner")
{

    const ownedOrganizations = await Organization.find({ userId });
        const allOrganizations = [
            ...ownedOrganizations.map(org => org._id.toString()),
        ];

        if (allOrganizations.includes(organizationId.toString())) {
            setCache(userId, organizationId);
            let orgKey = 'org-info-' + String(organizationId)
            setCache(orgKey , currentOrganization);
            const token =  orgToken(currentOrganization);
            return res.status(200).json({
                success: true,
                message: "Organization Session selected",
                data: token
            })   
        } else {
            return res.status(200).json({ success: false, message: "Cached organization does not match any valid organization." });
        }
}

else if(organization?.type == "Member")
    {
    
        const employeeRecords = await Employee.find({ adminId: organizationId ,userId:userId, status: "Active" });
        const employeeOrgIds = employeeRecords.map(emp => emp.adminId);
        const memberOrganizations = await Organization.find({ _id: { $in: employeeOrgIds } });
        const allOrganizations = [
            ...memberOrganizations.map(org => org._id.toString()),
        ];
        if (allOrganizations.includes(organizationId.toString())) {
            setCache(userId, organizationId);
            let orgKey = 'org-info-' + String(organizationId)
            setCache(orgKey , currentOrganization);
            const token =  orgToken(currentOrganization);
            return res.status(200).json({
                success: true,
                message: "Organization Session selected",
                data: token
            })   
        } else {
            return res.status(200).json({ success: false, message: "Cached organization does not match any valid organization." });
        }
    }
    
else if(organization?.type == "Pending Onboarding")
    {
        const employeeApplicationsFound = await Applications.find({
            userId: userId,
            status: "Pending"
        });
        const employeeApplicationsOrgIds = employeeApplicationsFound.map(emp => emp.adminId);
        const onboardMemberOrganizations = await Organization.find({ _id: { $in: employeeApplicationsOrgIds } });

        const allOrganizations = [
            ...onboardMemberOrganizations.map(org => org._id.toString())
        ];
        if (allOrganizations.includes(organizationId.toString())) {
            setCache(userId, organizationId);
            let orgKey = 'org-info-' + String(organizationId)
            setCache(orgKey , currentOrganization);
            const token =  orgToken(currentOrganization);
            return res.status(200).json({
                success: true,
                message: "Organization Session selected",
                data: token
            })   
        } else {
            return res.status(200).json({ success: false, message: "Cached organization does not match any valid organization." });
        }


    }
    else{
        return res.status(200).json({ success: false, message: "Cached organization does not match any valid organization." });
    }
}
       }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal Server Error " +String(error?.message),
            data: "",
        });

    }
});

// Get all organizations
organizationRouter.get('/getAll', async (req, res) => {
    try {
        const organizations = await Organization.find();
        res.status(200).json({
            success: true,
            error: "",
            data: organizations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal Server Error " + String(error?.message),
            data: "",
        });
    }
});

// Get all organizations by userID
// organizationRouter.get('/', async (req, res) => {
//     try {
//         let userId = req.user.id;
//         console.log(req.user,"req.user req.user")
//         const organizations = await Organization.find({ userId: userId });
//         res.status(200).json({
//             success: true,
//             error: "",
//             data: organizations
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             error:  "Internal Server Error " + String(error?.message),
//             data: "",
//         });
//     }
// });



organizationRouter.get('/', async (req, res) => {
    try {
        const userId = req.user.id;

        const employeeRecords = await Employee.find({ userId:userId ,status: "Active"}).select('adminId');
        const employeeOrgIds = employeeRecords.map(emp => emp.adminId);

        const employeeTerminateRecords = await Employee.find({ userId:userId ,status: "Terminated"}).select('adminId');
        const employeeTerminateOrgIds = employeeTerminateRecords.map(emp => emp.adminId);


        // await Employee.deleteOne({_id:"675366531ab5835359e3e3d7"});

        console.log("employeeRecordsemployeeRecords",employeeRecords)
        const employeeApplicationsFound = await Applications.find({
            userId: userId,
            status:"Pending"
        });


        const employeeTerminatedApplicationsFound = await Applications.find({
            userId: userId,
            status:"Terminated"
        });
        const employeeTerminatedApplicationsOrgIds = employeeTerminatedApplicationsFound.map(emp => emp.adminId);


        const employeeApplicationsOrgIds = employeeApplicationsFound.map(emp => emp.adminId);

        const ownedOrganizations = await Organization.find({ userId });
        const memberOrganizations = await Organization.find({ _id: { $in: employeeOrgIds } });
        const onboardMemberOrganizations = await Organization.find({ _id: { $in: employeeApplicationsOrgIds } });
        const terminateOnboardOrganizations = await Organization.find({ _id: { $in: employeeTerminatedApplicationsOrgIds } });
        const terminateMemberOrganizations = await Organization.find({ _id: { $in: employeeTerminateOrgIds } });

        const ownedOrganizationsWithEmployeeCount = await Promise.all(
            ownedOrganizations.map(async org => {
                const employeeCount = await Employee.countDocuments({ adminId: org._id });
                return {
                    ...org.toObject(),
                    type: 'Owner',
                    totalEmployees: employeeCount
                };
            })
        );

        const response = [
            ...ownedOrganizationsWithEmployeeCount,
            ...onboardMemberOrganizations.map(org => ({ ...org.toObject(), type: 'Pending Onboarding' })),
            ...memberOrganizations.map(org => ({ ...org.toObject(), type: 'Member' })),
            ...terminateMemberOrganizations.map(org => ({ ...org.toObject(), type: 'Terminated' })),
            // ...terminateOnboardOrganizations.map(org => ({ ...org.toObject(), type: 'Terminated' }))  
        ];

        res.status(200).json({ success: true, data: response });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: "Internal Server Error: " + error.message
        });
    }
});



// Get an organization by ID
organizationRouter.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const organization = await Organization.findById(id);
        if (!organization) {
            return res.status(404).json({
                success: false,
                error: 'Organization not found',
                data: "",
            });
        }
        res.status(200).json({
            success: true,
            error: "",
            data: organization
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error:  "Internal Server Error " + String(error?.message),
            data: "",
        });

    }
});






// Update an organization by ID
organizationRouter.put('/:id',upload.fields([
    { name: 'photo', maxCount: 1 },
]) ,async (req, res) => {
    try {
        const { id } = req.params;
        let updateData = req.body;
        let photo;
        photo = req?.files?.photo?.[0];
        const userId = req.user.id;
          // Check if the user is the owner of the organization
          const organizationFind = await Organization.findOne({ _id: id, userId });
          
          if (!organizationFind) {
              return res.status(403).json({
                  success: false,
                  error: "Permission denied: Employees cannot edit the organization.",
                  data: "",
              });
          }
        
          updateData.logo = photo?.filename ? photo?.filename : organizationFind?.logo;

        const organization = await Organization.findByIdAndUpdate(
            id, updateData, { new: true, runValidators: true }
        );
        if (!organization) {
            return res.status(404).json({
                success: false,
                error: 'Organization not found',
                data: "",
            });
        }
        res.status(200).json({
            success: true,
            error: "",
            data: organization
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error:  "Internal Server Error " + String(error?.message),
            data: "",
        });
    }
});

// Delete an organization by ID
organizationRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const organizationFind = await Organization.findOne({ _id: id, userId });

        if (!organizationFind) {
            return res.status(403).json({
                success: false,
                error: "Permission denied: Employees cannot delete the organization.",
                data: "",
            });
        }
  


        const organization = await Organization.findByIdAndDelete(id);
        if (!organization) {
            return res.status(404).json({
                success: false,
                error: 'Organization not found',
                data: "",
            });
        }
        res.status(200).json({
            success: true,
            error: "",
            data: "Organization deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error:  "Internal Server Error " + String(error?.message),
            data: "",
        });
    }
});


export default organizationRouter;
