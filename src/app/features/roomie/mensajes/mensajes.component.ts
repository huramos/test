import { Component, inject, OnInit, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, Conversation, Message } from '../../../core/services/message.service';

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="messages-container">
      <!-- Conversations List -->
      <div class="conversations-panel" [class.hidden-mobile]="selectedConversation()">
        <div class="panel-header">
          <h2>Mensajes</h2>
          @if (unreadCount() > 0) {
            <span class="unread-badge">{{ unreadCount() }}</span>
          }
        </div>

        @if (loadingConversations()) {
          <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
        } @else {
          <div class="conversations-list">
            @for (conv of conversations(); track conv.id) {
              <div class="conversation-item"
                   [class.active]="selectedConversation()?.id === conv.id"
                   [class.unread]="conv.unreadCount > 0"
                   (click)="selectConversation(conv)">
                <img [src]="conv.otherUser.avatar || getDefaultAvatar(conv.otherUser)" class="avatar" alt="Avatar">
                <div class="conversation-info">
                  <div class="conversation-header">
                    <strong>{{ conv.otherUser.firstName }} {{ conv.otherUser.lastName }}</strong>
                    @if (conv.lastMessage) {
                      <small>{{ conv.lastMessage.createdAt | date:'shortTime' }}</small>
                    }
                  </div>
                  <p class="property-name">{{ conv.room.property.title }} - {{ conv.room.name }}</p>
                  @if (conv.lastMessage) {
                    <p class="last-message">{{ conv.lastMessage.content }}</p>
                  }
                </div>
                @if (conv.unreadCount > 0) {
                  <span class="unread-count">{{ conv.unreadCount }}</span>
                }
              </div>
            } @empty {
              <div class="empty-conversations">
                <i class="fas fa-comments"></i>
                <p>No tienes conversaciones</p>
                <small>Las conversaciones aparecerán cuando hagas match con un propietario</small>
              </div>
            }
          </div>
        }
      </div>

      <!-- Chat Panel -->
      <div class="chat-panel" [class.hidden-mobile]="!selectedConversation()">
        @if (selectedConversation()) {
          <div class="chat-header">
            <button class="back-btn" (click)="clearSelection()">
              <i class="fas fa-arrow-left"></i>
            </button>
            <img [src]="selectedConversation()?.otherUser?.avatar || getDefaultAvatar(selectedConversation()?.otherUser)" class="avatar" alt="Avatar">
            <div class="chat-header-info">
              <strong>{{ selectedConversation()?.otherUser?.firstName }} {{ selectedConversation()?.otherUser?.lastName }}</strong>
              <small>{{ selectedConversation()?.room?.property?.title }}</small>
            </div>
          </div>

          <div class="messages-area" #messagesArea>
            @if (loadingMessages()) {
              <div class="loading-messages">
                <i class="fas fa-spinner fa-spin"></i>
              </div>
            } @else {
              @for (message of messages(); track message.id) {
                <div class="message" [class.own]="message.isOwn" [class.system]="message.type === 'SYSTEM'">
                  @if (!message.isOwn && message.type !== 'SYSTEM') {
                    <img [src]="message.sender.avatar || getDefaultAvatar(message.sender)" class="message-avatar" alt="Avatar">
                  }
                  <div class="message-content">
                    @if (message.type === 'IMAGE' && message.attachmentUrl) {
                      <img [src]="message.attachmentUrl" class="message-image" alt="Image">
                    }
                    <p>{{ message.content }}</p>
                    <span class="message-time">
                      {{ message.createdAt | date:'shortTime' }}
                      @if (message.isOwn && message.isRead) {
                        <i class="fas fa-check-double read-indicator"></i>
                      }
                    </span>
                  </div>
                </div>
              } @empty {
                <div class="no-messages">
                  <p>No hay mensajes. ¡Inicia la conversación!</p>
                </div>
              }
            }
          </div>

          <div class="chat-input">
            <input type="text"
                   [(ngModel)]="newMessage"
                   (keydown.enter)="sendMessage()"
                   placeholder="Escribe un mensaje..."
                   [disabled]="sending()">
            <button class="send-btn" (click)="sendMessage()" [disabled]="!newMessage.trim() || sending()">
              @if (sending()) {
                <i class="fas fa-spinner fa-spin"></i>
              } @else {
                <i class="fas fa-paper-plane"></i>
              }
            </button>
          </div>
        } @else {
          <div class="no-selection">
            <i class="fas fa-comments"></i>
            <h3>Selecciona una conversación</h3>
            <p>Elige una conversación de la lista para ver los mensajes</p>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: calc(100vh - 64px);
      overflow: hidden;
    }

    .messages-container {
      display: flex;
      height: 100%;
      background: #f9fafb;
      overflow: hidden;
    }

    .conversations-panel {
      width: 360px;
      min-width: 360px;
      background: white;
      border-right: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .panel-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
      h2 { margin: 0; font-size: 1.25rem; font-weight: 700; color: #1f2937; }
      .unread-badge {
        background: #ef4444; color: white; padding: 0.125rem 0.5rem;
        border-radius: 1rem; font-size: 0.75rem; font-weight: 600;
      }
    }

    .loading-state {
      display: flex; align-items: center; justify-content: center;
      padding: 2rem; color: #f59e0b;
      i { font-size: 1.5rem; }
    }

    .conversations-list {
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .conversation-item {
      display: flex; align-items: center; gap: 1rem;
      padding: 1rem 1.5rem; cursor: pointer; transition: background 0.2s;
      border-bottom: 1px solid #f3f4f6;
      &:hover { background: #f9fafb; }
      &.active { background: #fef3c7; }
      &.unread { background: #fffbeb;
        .conversation-info strong { color: #1f2937; font-weight: 700; }
      }
      .avatar { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; flex-shrink: 0; background: #e5e7eb; }
    }

    .conversation-info {
      flex: 1; min-width: 0;
      .conversation-header {
        display: flex; justify-content: space-between; align-items: center;
        strong { font-size: 0.9375rem; color: #374151; }
        small { color: #9ca3af; font-size: 0.75rem; }
      }
      .property-name { color: #6b7280; font-size: 0.75rem; margin: 0.125rem 0; }
      .last-message {
        color: #6b7280; font-size: 0.8125rem; margin: 0;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
    }

    .unread-count {
      background: #f59e0b; color: white; padding: 0.125rem 0.5rem;
      border-radius: 1rem; font-size: 0.75rem; font-weight: 600;
    }

    .empty-conversations {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 3rem; color: #9ca3af; text-align: center;
      flex: 1;
      i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
      p { margin: 0 0 0.5rem; font-weight: 500; color: #6b7280; }
      small { font-size: 0.8125rem; }
    }

    .chat-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: white;
      height: 100%;
      overflow: hidden;
      min-width: 0;
    }

    .chat-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      flex-shrink: 0;
      .back-btn {
        display: none; width: 36px; height: 36px; border: none;
        background: #f3f4f6; border-radius: 50%; cursor: pointer; color: #374151;
        &:hover { background: #e5e7eb; }
      }
      .avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; background: #e5e7eb; }
    }

    .chat-header-info {
      flex: 1;
      min-width: 0;
      strong { display: block; font-size: 0.9375rem; color: #1f2937; }
      small { color: #6b7280; font-size: 0.8125rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    }

    .messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      min-height: 0;
    }

    .loading-messages {
      display: flex; align-items: center; justify-content: center;
      flex: 1; color: #f59e0b;
    }

    .message {
      display: flex; gap: 0.75rem; max-width: 75%;
      &.own {
        margin-left: auto; flex-direction: row-reverse;
        .message-content { background: #f59e0b; color: white;
          .message-time { color: rgba(255,255,255,0.8); }
        }
      }
      &.system {
        max-width: 100%; justify-content: center;
        .message-content {
          background: #f3f4f6; color: #6b7280; font-size: 0.8125rem;
          padding: 0.5rem 1rem;
        }
      }
      .message-avatar { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; flex-shrink: 0; background: #e5e7eb; }
    }

    .message-content {
      background: #f3f4f6; padding: 0.75rem 1rem; border-radius: 1rem;
      p { margin: 0; font-size: 0.9375rem; line-height: 1.4; word-break: break-word; }
      .message-image { max-width: 100%; border-radius: 0.5rem; margin-bottom: 0.5rem; }
      .message-time {
        display: flex; align-items: center; gap: 0.25rem;
        font-size: 0.6875rem; color: #9ca3af; margin-top: 0.25rem;
        .read-indicator { color: #10b981; }
      }
    }

    .no-messages {
      display: flex; align-items: center; justify-content: center; flex: 1;
      color: #9ca3af; font-size: 0.9375rem;
    }

    .chat-input {
      display: flex;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-top: 1px solid #e5e7eb;
      flex-shrink: 0;
      background: white;
      input {
        flex: 1; padding: 0.75rem 1rem; border: 1px solid #d1d5db;
        border-radius: 1.5rem; font-size: 0.9375rem;
        &:focus { outline: none; border-color: #f59e0b; }
        &:disabled { background: #f9fafb; }
      }
      .send-btn {
        width: 44px; height: 44px; border: none; background: #f59e0b;
        color: white; border-radius: 50%; cursor: pointer; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        &:hover:not(:disabled) { background: #d97706; }
        &:disabled { opacity: 0.6; cursor: not-allowed; }
      }
    }

    .no-selection {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center; color: #9ca3af;
      i { font-size: 4rem; margin-bottom: 1rem; opacity: 0.3; }
      h3 { margin: 0 0 0.5rem; color: #374151; }
      p { margin: 0; }
    }

    @media (max-width: 768px) {
      :host {
        height: calc(100vh - 64px);
      }
      .conversations-panel {
        width: 100%;
        min-width: 100%;
        &.hidden-mobile { display: none; }
      }
      .chat-panel {
        &.hidden-mobile { display: none; }
      }
      .chat-header .back-btn { display: flex; align-items: center; justify-content: center; }
    }
  `]
})
export class MensajesComponent implements OnInit, AfterViewChecked {
  private messageService = inject(MessageService);

  @ViewChild('messagesArea') messagesArea!: ElementRef;

  conversations = signal<Conversation[]>([]);
  selectedConversation = signal<Conversation | null>(null);
  messages = signal<Message[]>([]);
  unreadCount = signal(0);

  loadingConversations = signal(false);
  loadingMessages = signal(false);
  sending = signal(false);

  newMessage = '';
  private shouldScroll = false;

  ngOnInit() {
    this.loadConversations();
    this.loadUnreadCount();
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  loadConversations() {
    this.loadingConversations.set(true);

    this.messageService.getConversations().subscribe({
      next: (data) => {
        this.conversations.set(data);
        this.loadingConversations.set(false);
      },
      error: () => {
        this.loadingConversations.set(false);
      }
    });
  }

  loadUnreadCount() {
    this.messageService.getUnreadCount().subscribe({
      next: (data) => {
        this.unreadCount.set(data.unread);
      }
    });
  }

  selectConversation(conv: Conversation) {
    this.selectedConversation.set(conv);
    this.loadMessages(conv.id);

    if (conv.unreadCount > 0) {
      this.markAsRead(conv.id);
    }
  }

  clearSelection() {
    this.selectedConversation.set(null);
    this.messages.set([]);
  }

  loadMessages(conversationId: string) {
    this.loadingMessages.set(true);

    this.messageService.getMessages(conversationId).subscribe({
      next: (response) => {
        this.messages.set(response.data);
        this.loadingMessages.set(false);
        this.shouldScroll = true;
      },
      error: () => {
        this.loadingMessages.set(false);
      }
    });
  }

  sendMessage() {
    const conv = this.selectedConversation();
    if (!conv || !this.newMessage.trim()) return;

    this.sending.set(true);

    this.messageService.sendMessage({
      conversationId: conv.id,
      content: this.newMessage.trim()
    }).subscribe({
      next: (message) => {
        this.messages.update(msgs => [...msgs, message]);
        this.newMessage = '';
        this.sending.set(false);
        this.shouldScroll = true;

        // Update last message in conversation list
        this.conversations.update(convs => convs.map(c => {
          if (c.id === conv.id) {
            return {
              ...c,
              lastMessage: {
                content: message.content,
                createdAt: message.createdAt,
                type: message.type
              },
              lastMessageAt: message.createdAt
            };
          }
          return c;
        }));
      },
      error: () => {
        this.sending.set(false);
        alert('Error al enviar el mensaje');
      }
    });
  }

  markAsRead(conversationId: string) {
    this.messageService.markAsRead(conversationId).subscribe({
      next: () => {
        // Update unread count in conversation list
        this.conversations.update(convs => convs.map(c => {
          if (c.id === conversationId) {
            return { ...c, unreadCount: 0 };
          }
          return c;
        }));
        this.loadUnreadCount();
      }
    });
  }

  getDefaultAvatar(user?: { firstName?: string; lastName?: string }): string {
    const name = user ? `${user.firstName || ''}+${user.lastName || ''}` : 'User';
    return `https://ui-avatars.com/api/?name=${name}&background=e5e7eb&color=374151`;
  }

  private scrollToBottom() {
    if (this.messagesArea) {
      const element = this.messagesArea.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }
}
