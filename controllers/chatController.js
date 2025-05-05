import { find } from '../models/message';

export async function getMessages(req, res) {
    const { organizationId, senderId, receiverId } = req.params;
    try {
        const messages = await find({
            organization: organizationId,
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        }).sort({ timestamp: 1 }); // Sort by timestamp
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
}
