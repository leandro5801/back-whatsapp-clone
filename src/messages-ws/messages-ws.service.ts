import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { User } from '../auth/entities/user.entity';
import { ConversationService } from 'src/conversation/conversation.service';
import { MessagesService } from 'src/messages/messages.service';
import { CreateMessageDto } from 'src/messages/dto/create-message.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';


@Injectable()
export class MessagesWsService {
  
  constructor(
    private readonly conversationService: ConversationService,
    private readonly messageService: MessagesService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService
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
      const userId = this.jwtService.verify(
        client.handshake.headers.authentication as string,
      );
      if (!conversation) {
        client.emit('error', 'conversation not found');
        return;
      }

      client.join(conversationId);
      logger.log(`user ${userId} join to ${conversation.name_conversation}`);
    
    } catch (error) {
      console.error(error);
      client.emit('error', 'invalid token');
    }
  }

  async handleSendMessage(client: Socket, createMessage: CreateMessageDto) {
    // Send the message in la conversation
    try {
      const newMessage = await this.messageService.create(createMessage);
      client.to(createMessage.id_conversation).emit('message', newMessage);
    } catch (error) {
      console.error(error)
      client.emit('error', 'error creating message');
    }
  }


  async handleUserConnection(client: Socket, userId: string, isConnected: boolean) {
    const user = await this.authService.findOneById(userId);
    user.socketId = isConnected ? client.id : "";
    user.isActive = isConnected;
    await this.authService.update(user);
  }
}
