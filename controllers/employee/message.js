import express from 'express';
import { Types } from 'mongoose';
import Message from '../../schema/Message.js';
import Employee from '../../schema/Employee.js';
import organization from '../../schema/organization.js';
import mongoose, { connect, disconnect } from 'mongoose';

const messageRouter = express.Router();

// Send a message
messageRouter.post('/', async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    const employee = await Employee.findById(senderId);
    const adminId = new Types.ObjectId(employee.adminId);

    // Validate input
    if (!senderId || !receiverId || !adminId || !content) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    // Create a new message
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      adminId: adminId,
      content,
    });
    await newMessage.save();
    res.success({
      message: ' Message sent successfully',
    });
  } catch (error) {
    next(error)
  }
});

// Get messages for an organization
messageRouter.get('/details', async (req, res,next) => {
  try {
    const { receiver, page = 1, limit = 50 } = req.query;
    const userId = req.user.id;

    const employee = await Employee.findById(req.query.empId);
    const employeeReciever = await Employee.findById(new Types.ObjectId(receiver));
    const adminId = new Types.ObjectId(employee.adminId);

    let query = {};

    if(employeeReciever)
    {
      query = {
        adminId: adminId,
        $or: [
          { sender: req.query.empId, receiver: new Types.ObjectId(receiver) },
          { sender: new Types.ObjectId(receiver), receiver: req.query.empId },
        ]
      }
    }
    else{
      query = {
        adminId: adminId,
        $or: [
          { sender: req.query.empId, receiver: new Types.ObjectId(adminId) },
          { sender: new Types.ObjectId(adminId), receiver: req.query.empId },
          { sender: req.query.empId, receiver: new Types.ObjectId(receiver) },
          { sender: new Types.ObjectId(receiver), receiver: req.query.empId },
        ]
      }
    }

    

    if (!userId || !adminId) {
      return res.status(400).json({ message: 'User ID and Organization ID are required' });
    }
    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Fetch the messages with pagination
    const messages = await Message.find(query)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select('isViewed content sender receiver createdAt')
      .sort({ createdAt: 1 }); // Sort by timestamp descending

      const result = await Message.updateMany(query, { isViewed: true });
    res.success({ messages });
  } catch (error) {
    next(error)
  }
});

messageRouter.get('/contact', async (req, res,next) => {
  try {

    const uriDB2 = process.env.MONGODB_ACCOUNT_CONNECTION;
    const { page = 1, limit = 50 } = req.query;

    const userId = req.user.id;
    const employee = await Employee.findById(req.query.empId);
    const adminId = new Types.ObjectId(employee.adminId);
    if (!adminId) {
      return res.status(400).json({ message: 'Organization ID are required' });
    }
    // const db2Connection = mongoose.createConnection(uriDB2, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // });
    // const UserSchema = new mongoose.Schema({
    //   _id: mongoose.Schema.Types.ObjectId,
    //   firstName: String,
    //   email: String,
    // });
    // const User = db2Connection.model('User', UserSchema);

    //const users = await User.find().lean();

    const currentOrganization = await organization.findById(adminId);

    let contact = [
      {
        firstName: "Admin",
        lastName: currentOrganization.name,
        email: (currentOrganization.name + "@clikkle.com"),
        _id: currentOrganization._id
      }];

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    const query = { adminId: adminId, status: "Active",userId: { $ne: userId } };

    // Fetch the messages with pagination
    const employees = await Employee.find(query)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)
      .select('email firstName lastName _id userId') // Select only the specified fields
      .sort({ firstName: 1 });

    const employeeIds = employees.map((employee) => employee._id); // Extract employee IDs

    // Fetch users whose IDs match the employee IDs
    // const users = await User.find({ _id: { $in: employeeIds } });
    
    const combinedData = employees.map(employee => {
      // const user = users.find((usr) => usr._id.toString() === employee._id.toString());
      
      return {
        _id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: null,
        
        // email: user ? user.email : null, // Match on firstName
      };
    });

    contact = [...contact, ...combinedData]
    // await db2Connection.close()
    // .then(() => console.log("Disconnected from DB2"))
    // .catch(err => console.error("Error disconnecting from DB2:", err));
    res.success({ contact });
  } catch (error) {
    next(error)
  }
});

messageRouter.get('/', async (req, res,next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;
    const empId = req.query.empId;
    const employee = await Employee.findById(empId);
    const adminId = new Types.ObjectId(employee.adminId);

    if (!userId || !adminId) {
      return res.status(400).json({ message: 'User ID and Organization ID are required' });
    }

    const currentOrganization = await organization.findById(adminId);
    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // Build the aggregation pipeline
    const pipeline = [
      {
        $match: {
          adminId: adminId,
          $or: [
            { sender: new Types.ObjectId(empId) },
            { receiver: new Types.ObjectId(empId) }
          ]
        }
      },
      {
        $lookup: {
          from: 'employees', // Ensure this matches your Employee collection name
          localField: 'receiver',
          foreignField: '_id',
          as: 'receiver'
        }
      },
      {
        $unwind: {
          path: '$receiver',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'employees', // Lookup the sender details from the 'employees' collection
          localField: 'sender',
          foreignField: '_id',
          as: 'sender'
        }
      },
      {
        $unwind: {
          path: '$sender',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          'receiver._id': { $ifNull: ['$receiver._id', currentOrganization._id] },
          'receiver.firstName': { $ifNull: ['$receiver.firstName', 'Admin'] },
          'receiver.lastName': { $ifNull: ['$receiver.lastName', currentOrganization.name] },
          'sender._id': { $ifNull: ['$sender._id', currentOrganization._id] },
          'sender.firstName': { $ifNull: ['$sender.firstName', 'Admin'] },
          'sender.lastName': { $ifNull: ['$sender.lastName', currentOrganization.name] }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: { sender: '$sender._id', receiver: '$receiver._id' }, // Group by sender and receiver pair
          latestMessage: { $first: '$$ROOT' }, // Get the latest message in each group
        }
      },
      {
        $replaceRoot: { newRoot: '$latestMessage' } // Replace root with the grouped message
      },
      {
        $skip: (pageNumber - 1) * pageSize
      },
      {
        $limit: pageSize
      },
      {
        $project: {
          // _id	: 0,
          'sender._id': 1,
          'sender.firstName': 1,
          'sender.lastName': 1,
          'receiver._id': 1,
          'receiver.firstName': 1,
          'receiver.lastName': 1,
          content: 1,
          createdAt: 1,
          isViewed: 1,
        }
      }
    ];
    
    // Execute the aggregation pipeline
    const messages = await Message.aggregate(pipeline);
  
    function removeOldDuplicate(messages) {
      const uniquePairsMap = new Map();
    
      // Iterate through messages and store the latest message for each pair
      for (const message of messages) {
        const senderReceiverPair = `${message.sender._id}-${message.receiver._id}`;
        const reversePair = `${message.receiver._id}-${message.sender._id}`;
    
        // Check if the combination already exists and update with the latest message
        if (uniquePairsMap.has(senderReceiverPair) || uniquePairsMap.has(reversePair)) {
          const existingPair = uniquePairsMap.has(senderReceiverPair) 
            ? senderReceiverPair 
            : reversePair;
    
          // Replace the old message if the current message is more recent
          if (message.createdAt > uniquePairsMap.get(existingPair).createdAt) {
            uniquePairsMap.set(existingPair, message);
          }
        } else {
          // Add the new pair with the current message
          uniquePairsMap.set(senderReceiverPair, message);
        }
      }
    
      // Return the latest messages for all unique pairs
      return Array.from(uniquePairsMap.values());
    }
    
    const filteredMessages = removeOldDuplicate(messages);
    res.success({ messages: filteredMessages });
  } catch (error) {
    next(error)
  }
});

messageRouter.get('/unreadnotification', async (req, res, next) => {
  try {
    // const senderId = new Types.ObjectId(req.user.id);
    const senderId = new Types.ObjectId(req.query.empId);
    
    const totalUnread = await Message.find({
      receiver: senderId,
      isViewed: false // Add the condition for unread messages
    });

    res.status(200).json({ totalUnread });
  } catch (error) {
    next(error)
  }
});


messageRouter.delete('/deleteuserchat', async (req, res, next) => {
  try {
    const { sender,reciever } = req.query;
    const senderId = new Types.ObjectId(sender);
    const receiverId = new Types.ObjectId(reciever);
    const result = await Message.deleteMany({
      $or: [
        { sender: senderId, receiver: receiverId},
        { sender: receiverId, receiver: senderId }
      ]
    });

    res.success({
      message: `Deleted ${result.deletedCount} messages.`,
    });
  } catch (error) {
    next(error)
  }
});


export default messageRouter;
