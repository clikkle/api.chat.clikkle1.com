import { Router } from 'express';
const router = Router();
import { getMessages } from '../controllers/chatController';

router.get('/chat/:organizationId/:senderId/:receiverId', getMessages);

export default router;
