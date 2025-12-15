import { MessageType, UserRole } from '@prisma/client';
import prisma from '../../config/prisma';
import { SendMessageDto, MessageFilterDto } from './messages.dto';
import {
  NotFoundException,
  ForbiddenException
} from '../../common/filters/error.filter';

export class MessagesService {
  async getConversations(userId: string, userRole: UserRole) {
    let where: any = { isActive: true };

    if (userRole === UserRole.PROPIETARIO) {
      where.match = {
        room: {
          property: {
            ownerId: userId
          }
        }
      };
    } else if (userRole === UserRole.ROOMIE) {
      where.match = {
        roomieId: userId
      };
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        match: {
          include: {
            room: {
              include: {
                property: {
                  include: { owner: true }
                }
              }
            },
            roomie: true
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    // Get last message for each conversation
    const result = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await prisma.message.findFirst({
          where: { conversationId: conv.id },
          orderBy: { createdAt: 'desc' }
        });

        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            isRead: false,
            senderId: { not: userId }
          }
        });

        const otherUser = userRole === UserRole.PROPIETARIO
          ? {
              id: conv.match.roomie.id,
              firstName: conv.match.roomie.firstName,
              lastName: conv.match.roomie.lastName,
              avatar: conv.match.roomie.avatar
            }
          : {
              id: conv.match.room.property.owner.id,
              firstName: conv.match.room.property.owner.firstName,
              lastName: conv.match.room.property.owner.lastName,
              avatar: conv.match.room.property.owner.avatar
            };

        return {
          id: conv.id,
          matchId: conv.matchId,
          otherUser,
          room: {
            id: conv.match.room.id,
            name: conv.match.room.name,
            property: {
              id: conv.match.room.property.id,
              title: conv.match.room.property.title
            }
          },
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt,
            type: lastMessage.type
          } : null,
          unreadCount,
          lastMessageAt: conv.lastMessageAt
        };
      })
    );

    return result;
  }

  async getMessages(conversationId: string, userId: string, userRole: UserRole, filters: MessageFilterDto) {
    // Verify access to conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        match: {
          include: {
            room: {
              include: { property: true }
            }
          }
        }
      }
    });

    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada');
    }

    const isOwner = conversation.match.room.property.ownerId === userId;
    const isRoomie = conversation.match.roomieId === userId;
    const isAdmin = userRole === UserRole.ADMIN;

    if (!isOwner && !isRoomie && !isAdmin) {
      throw new ForbiddenException('No tienes acceso a esta conversación');
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 50;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId },
        include: { sender: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.message.count({ where: { conversationId } })
    ]);

    // Mark messages as read
    const unreadMessageIds = messages
      .filter((msg) => !msg.isRead && msg.senderId !== userId)
      .map((m) => m.id);

    if (unreadMessageIds.length > 0) {
      await prisma.message.updateMany({
        where: { id: { in: unreadMessageIds } },
        data: { isRead: true, readAt: new Date() }
      });
    }

    return {
      data: messages.map((msg) => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        attachmentUrl: msg.attachmentUrl,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        sender: {
          id: msg.sender.id,
          firstName: msg.sender.firstName,
          lastName: msg.sender.lastName,
          avatar: msg.sender.avatar
        },
        isOwn: msg.senderId === userId
      })).reverse(),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async sendMessage(userId: string, userRole: UserRole, dto: SendMessageDto) {
    // Verify access to conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: dto.conversationId },
      include: {
        match: {
          include: {
            room: {
              include: { property: true }
            }
          }
        }
      }
    });

    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada');
    }

    const isOwner = conversation.match.room.property.ownerId === userId;
    const isRoomie = conversation.match.roomieId === userId;

    if (!isOwner && !isRoomie) {
      throw new ForbiddenException('No tienes acceso a esta conversación');
    }

    if (!conversation.isActive) {
      throw new ForbiddenException('Esta conversación está cerrada');
    }

    const message = await prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        senderId: userId,
        type: dto.type || MessageType.TEXT,
        content: dto.content,
        attachmentUrl: dto.attachmentUrl
      }
    });

    // Update conversation lastMessageAt
    await prisma.conversation.update({
      where: { id: dto.conversationId },
      data: { lastMessageAt: new Date() }
    });

    return {
      ...message,
      isOwn: true
    };
  }

  async markAsRead(conversationId: string, userId: string) {
    await prisma.message.updateMany({
      where: {
        conversationId,
        isRead: false,
        senderId: { not: userId }
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    return { message: 'Mensajes marcados como leídos' };
  }

  async getUnreadCount(userId: string, userRole: UserRole) {
    let conversationWhere: any = { isActive: true };

    if (userRole === UserRole.PROPIETARIO) {
      conversationWhere.match = {
        room: {
          property: {
            ownerId: userId
          }
        }
      };
    } else if (userRole === UserRole.ROOMIE) {
      conversationWhere.match = {
        roomieId: userId
      };
    }

    // Get all conversations for the user
    const conversations = await prisma.conversation.findMany({
      where: conversationWhere,
      select: { id: true }
    });

    const conversationIds = conversations.map(c => c.id);

    const count = await prisma.message.count({
      where: {
        conversationId: { in: conversationIds },
        isRead: false,
        senderId: { not: userId }
      }
    });

    return { unread: count };
  }
}
