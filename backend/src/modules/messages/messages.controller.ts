import { Response, NextFunction } from 'express';
import { MessagesService } from './messages.service';
import { AuthRequest } from '../../common/guards/auth.guard';

const messagesService = new MessagesService();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Sistema de mensajería
 */

export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await messagesService.getConversations(req.user!.id, req.user!.role);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await messagesService.getMessages(
      req.params.conversationId,
      req.user!.id,
      req.user!.role,
      req.query as any
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await messagesService.sendMessage(
      req.user!.id,
      req.user!.role,
      req.body
    );
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await messagesService.markAsRead(
      req.params.conversationId,
      req.user!.id
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await messagesService.getUnreadCount(req.user!.id, req.user!.role);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
