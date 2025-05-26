import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtPayload } from '../auth/interfaces';
import { NewMessageDto } from './dtos/new-message.dto';
import { MessagesWsService } from './messages-ws.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { Logger } from '@nestjs/common';
import { Message } from 'src/messages/entities/message.entity';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { CreateConversationDto } from 'src/conversation/dto/create-conversation.dto';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  private readonly logger = new Logger(MessagesWsGateway.name);
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  /* afterInit() {
    this.wss.on('connection', (client: Socket) => {
      // Establece un intervalo para enviar un mensaje de "ping" cada 10 segundos
      let pingInterval = setInterval(() => {
        client.emit('ping');
      }, 10000);

      // Escucha el evento "pong" enviado por el cliente
      client.on('pong', () => {
        // Si el cliente responde con un "pong", se considera que está conectado
        clearInterval(pingInterval);

        pingInterval = setInterval(() => {}, 10000);
      });

      // Si el client no respond despots de 30 segundo, se consider que se ha disconnect
      client.on('disconnect', () => {
        clearInterval(pingInterval);
        // Llama al method handleDisconnect para realizer las actions necessarian
        this.handleDisconnect(client);
      });
    });
  } */
  //!! Front
  /* socket.on('ping', () => {
    socket.emit('pong');
  });
   */
  async handleConnection(client: Socket) {
    const token = client.handshake.auth;
    try {
      let payload = this.messagesWsService.returnPayload(token.token);

      const connectedUsers = await this.messagesWsService.handleUserConnection(
        client,
        payload.id,
        true,
        this.logger,
      );
      this.wss.emit('connectedUsers', connectedUsers);
      console.log(client.id);
    } catch (error) {
      client.emit('invalid');
      client.disconnect();
      return;
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      const token = client.handshake.auth;
      let payload = this.messagesWsService.returnPayload(token.token);
      const connectedUsers = await this.messagesWsService.handleUserConnection(
        client,
        payload.id,
        false,
        this.logger,
      );
      this.wss.emit('connectedUsers', connectedUsers);
    } catch (error) {
      console.log('es en el catch');

      this.logger.error(`User ${client.id} disconnected`);
    }
  }
  @SubscribeMessage('join-conversation')
  async JoinConversation(client: Socket, conversationId: string) {
    this.messagesWsService.handleJoinConversation(
      client,
      conversationId,
      this.logger,
    );
  }

  @SubscribeMessage('send-message')
  async SendMessage(client: Socket, createMessageDto: CreateMessageDto) {
    this.messagesWsService.handleSendMessage(
      client,
      createMessageDto,
      this.wss,
    );
  }
  @SubscribeMessage('leave-conversation')
  async LeaveConversation(client: Socket, conversationId: string) {
    this.messagesWsService.handleLeaveConversation(client, conversationId);
  }

  @SubscribeMessage('update-message')
  async UpdateMessage(client: Socket, message: Message) {
    this.messagesWsService.handleUpdateMessage(client, message, this.wss);
  }
  @SubscribeMessage('addNewConversation')
  async AddNewGroup(client: Socket, conversation: CreateConversationDto) {
    this.messagesWsService.handleAddNewConversation(
      client,
      conversation,
      this.wss,
    );
  }

  /*   @SubscribeMessage('message-from-client')
  onMessageFromClient( client: Socket, payload: NewMessageDto ) {
  
    // Emit únicamente al cliente.
    // client.emit('message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!'
    // });

    // Emitir a todos MENOS, al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!'
    // });

    this.wss.emit('message-from-server', {
      fullName: this.messagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message!!'
    });

  } */
}
