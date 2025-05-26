import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ConversationService } from 'src/conversation/conversation.service';
import { MessagesService } from 'src/messages/messages.service';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { JwtPayload } from 'src/auth/interfaces';
import { Message } from 'src/messages/entities/message.entity';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { CreateConversationDto } from 'src/conversation/dto/create-conversation.dto';

@Injectable()
export class MessagesWsService {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessagesService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async handleJoinConversation(
    client: Socket,
    conversationId: string,
    logger: Logger,
  ) {
    try {
      const conversation = await this.conversationService.findOneById(
        conversationId,
      );
      const token = client.handshake.auth;
      const userId = this.returnPayload(token.token);
      if (!conversation) {
        client.emit('error', 'conversation not found');
        return;
      }

      client.join(conversationId);
      const user = await this.authService.findOneById(userId.id);
      logger.log(
        conversation.name_conversation.length <= 1
          ? `user ${user.fullName} join with ${
              conversation.members.filter((member) => member.id !== user.id)[0]
                .fullName
            }`
          : `user ${user.fullName} join to ${conversation.name_conversation}`,
      );
    } catch (error) {
      console.log(error);
      client.emit('error', 'invalid token');
    }
  }

  handleLeaveConversation(client: Socket, conversationId: string) {
    client.leave(conversationId);
  }

  async handleSendMessage(
    client: Socket,
    createMessage: CreateMessageDto,
    wss: Server,
  ) {
    const { id_conversation, message } = createMessage;

    try {
      const token = client.handshake.auth;
      const payload = this.returnPayload(token.token);
      const user = await this.authService.findOneById(payload.id);
      const newMessage = await this.messageService.create(createMessage, user);
      wss.to(createMessage.id_conversation).emit('message', newMessage);
    } catch (error) {
      console.error(error);
      client.emit('error', 'error creating message');
    }
  }

  async handleUserConnection(
    client: Socket,
    userId: string,
    isConnected: boolean,
    logger: Logger,
  ) {
    const user = await this.authService.findOneById(userId);
    user.socketId = isConnected ? client.id : '';
    user.isActive = isConnected;
    await this.authService.update(user);
    isConnected
      ? logger.log(`User ${user.fullName} connected`)
      : logger.error(`User ${user.fullName} disconnected`);
    return this.authService.getConnectedUser();
  }

  async handleUpdateMessage(client: Socket, message: Message, wss: Server) {
    try {
      await this.messageService.update(message.id, {
        id_conversation: message.conversation.id,
        message: message.message,
        sender: message.sender.id,
        isModified: true,
      });
    } catch (error) {}
    wss.to(message.conversation?.id).emit('updated-message', message);
  }
  async handleAddNewConversation(
    client: Socket,
    conversation: CreateConversationDto,
    wss: Server,
  ) {
    let newConversation: Conversation;
    try {
      newConversation = await this.conversationService.create(conversation);
    } catch (error) {}
    const activeMembers = newConversation.members.filter(
      (member) => member.socketId !== '',
    );
    console.log(activeMembers.length);

    if (activeMembers.length > 0) {
      activeMembers.forEach((member) => {
        console.log(member.socketId);
        wss.to(member.socketId).emit('addNewChat', newConversation);
      });
    }
  }

  returnPayload(token: string) {
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify(token, {
        ignoreExpiration: false,
      });
      return payload;
    } catch (error) {
      return null;
    }
  }
}
