import { createServer } from 'http';
import socketIO from 'socket.io';
import Message from './models/message';

const server = createServer(app);
const io = socketIO(server);

io.on('connection', (socket) => {
    console.log('New client connected');

    // Join room for organization
    socket.on('joinOrganization', (organizationId) => {
        socket.join(organizationId);
    });

    // Listen for sending messages
    socket.on('sendMessage', async (data) => {
        const { sender, receiver, organization, message } = data;

        // Save message to database
        const newMessage = new Message({ sender, receiver, organization, message });
        await newMessage.save();

        // Emit the message to users in the same organization
        io.to(organization).emit('receiveMessage', newMessage);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(8000, () => {
    console.log('Server running on port 8000');
});
