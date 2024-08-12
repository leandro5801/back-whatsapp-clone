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

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  private readonly logger = new Logger(MessagesWsGateway.name)
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
    
  ) {}

  afterInit() {
    this.wss.on('connection', (client: Socket) => {
      // Establece un intervalo para enviar un mensaje de "ping" cada 10 segundos
      let pingInterval = setInterval(() => {
        client.emit('ping');
      }, 10000);

      // Escucha el evento "pong" enviado por el cliente
      client.on('pong', () => {
        // Si el cliente responde con un "pong", se considera que está conectado
        clearInterval(pingInterval);
        pingInterval = setInterval(() => {
          client.emit('ping');
        }, 10000);
      });

      // Si el client no respond despots de 30 segundo, se consider que se ha disconnect
      client.on('disconnect', () => {
        clearInterval(pingInterval);
        // Llama al method handleDisconnect para realizer las actions necessarian
        this.handleDisconnect(client);
      });
    });
  }
  //!! Front
  /* socket.on('ping', () => {
    socket.emit('pong');
  });
   */
  async handleConnection(client: Socket) {
    const token = client.handshake.auth 
    let payload: JwtPayload;
    
    try {
      payload = this.jwtService.verify(token.token);
      
      this.messagesWsService.handleUserConnection(client, payload.id, true);
      this.logger.log(`User ${payload.id} connected`);
    } catch (error) {
      client.emit('invalid')
      client.disconnect();
      return;
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const token = client.handshake.headers.authentication as string;
      let payload: JwtPayload;

      payload = this.jwtService.verify(token);
      this.messagesWsService.handleUserConnection(client, payload.id, false);
      this.logger.error(`User ${payload.id} disconnected`)
    } catch (error) {
      client.disconnect()
    }
  }
  @SubscribeMessage('join-conversation')
  async JoinConversation(client: Socket, conversationId: string) {
    this.messagesWsService.handleJoinConversation(
      client,
      conversationId,
      this.logger
    );
  }

  @SubscribeMessage('send-message')
  async SendMessage(client: Socket, createMessageDto: CreateMessageDto) {
    this.messagesWsService.handleSendMessage(client, createMessageDto);
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
