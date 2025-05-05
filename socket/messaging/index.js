import Employee from "../../schema/Employee.js";
import Message from "../../schema/Message.js";
import organization from "../../schema/organization.js";
import { generateTemplate, getOrganization } from '../../utils/functions.js';
import transporter from '../../libs/nodemailer.js';
import fs from 'fs';
import mongoose, { connect, disconnect } from 'mongoose';
import { Types } from 'mongoose';

async function sendEmail(messageData, receiver, orgId) {
    try {
        let userEmail = "";
        let portalLink = "";
        const receiverId = messageData.receiver._id;
       
        if (receiver===orgId || receiverId.equals(orgId) ) {
            const organizationData = await organization.findById(receiverId);
            userEmail = organizationData.email;
            portalLink = "https://hr.clikkle.com/chat";
        } else {

            /* const uriDB2 = process.env.MONGODB_ACCOUNT_CONNECTION;
            const db2Connection = mongoose.createConnection(uriDB2, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            const UserSchema = new mongoose.Schema({
                _id: mongoose.Schema.Types.ObjectId,
                firstName: String,
                email: String,
                recoveryEmail: String,
            });


            const User = db2Connection.model('User', UserSchema);
            const userData = await User.findById(receiverId); */
            const employee = await Employee.findById(receiverId);
            userEmail = employee.email;
            // portalLink = "https://employee.hr.clikkle.com/chat";
         
            portalLink = "https://hr.clikkle.com/chat";
         
            // await db2Connection.close()
            //     .then(() => console.log("Disconnected from DB2 after sending email"))
            //     .catch(err => console.error("Error disconnecting from DB2:", err));
        }
       
        const html = fs.readFileSync('templates/email/sendChatNotification.html', {
            encoding: 'utf-8',
        });

        const data = {
            senderFullName: `${messageData.sender.firstName} ${messageData.sender.lastName}`,
            senderName: messageData.sender.firstName,
            messageTime: new Date(messageData.createdAt).toLocaleTimeString(),
            messagecontent: messageData.content,
            portalLink: portalLink
        };

        const template = generateTemplate(html, data);

        // console.log('template:', template);
        const info = await transporter.sendMail({
            from: `"Clikkle Hr"<hr@clikkle.com> `, // sender address
            to: userEmail, //"praveenkota786@gmail.com", // list of receivers
            subject: `You have new message from ${messageData.sender.firstName}!!`, // Subject line
            html: template, // html body
        });

        console.log('Email sent successfully ', info.messageId);

    } catch (err) {
        console.error(err);
    }
}

export const socketMessaging = (socket, io, users) => {
    console.log('A user connected:', socket.id);

    // Listen for user registration (user ID sent from client)
    socket.on('registerUser', (userId) => {
        users.set(userId, socket.id);
        console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
    });

    socket.on('sendChat', async ({ employeeId,sender, receiver, adminId = null, content }) => {
        console.log(`Message from ${sender} to ${receiver}: ${content}`);
        let orgId = adminId;
        const receiverSocketId = users.get(receiver);

        if (!orgId) {
            const employee = await Employee.findById(employeeId);
            orgId = employee.adminId;
        }
        const currentOrganization = await organization.findById(orgId);

        const newMessage = new Message({
            sender: sender,
            receiver: receiver,
            adminId: orgId,
            content,
            isViewed: false,
            // isViewed: (receiverSocketId) ? true : false,
        });
        const saveMessage = await newMessage.save();

        console.log('saveMessage._id:', saveMessage);
        // Build the aggregation pipeline
        const pipeline = [
            {
                $match: {
                    _id: saveMessage._id
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
                $project: {
                    'sender._id': 1,
                    'sender.firstName': 1,
                    'sender.lastName': 1,
                    'receiver._id': 1,
                    'receiver.firstName': 1,
                    'receiver.lastName': 1,
                    content: 1,
                    createdAt: 1,
                    isViewed: 1,
                    adminId: 1,
                    createdAt: 1,
                    _id: 1
                }
            }
        ];

        // Execute the aggregation pipeline
        const messages = await Message.aggregate(pipeline);
console.log(messages,"messagesmessagesmessages")
        if (receiverSocketId && saveMessage) {
            
            // Send the message to the specific receiver

            // console.log('messagesmessages:', messages[0]);
            io.to(receiverSocketId).emit('receiveChat', messages[0]);
            
            // io.to(receiverSocketId).emit('receiveChat', saveMessage);
        }
            await sendEmail(messages[0], receiver, orgId);
           });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Remove user from the map
        for (const [userId, socketId] of users.entries()) {
            if (socketId === socket.id) {
                users.delete(userId);
                console.log(`User removed: ${userId}`);
                break;
            }
        }
    });
}

