import { Router } from 'express';
import * as messagesController from './messages.controller';
import { authGuard } from '../../common/guards/auth.guard';
import { validationPipe } from '../../common/pipes/validation.pipe';
import { SendMessageDto } from './messages.dto';

const router = Router();

router.use(authGuard);

// Conversations
router.get('/conversations', messagesController.getConversations);
router.get('/conversations/:conversationId', messagesController.getMessages);
router.post('/conversations/:conversationId/read', messagesController.markAsRead);

// Messages
router.post('/', validationPipe(SendMessageDto), messagesController.sendMessage);

// Unread count
router.get('/unread', messagesController.getUnreadCount);

export default router;
