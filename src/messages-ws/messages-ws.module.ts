import { Module } from '@nestjs/common';
import { MessagesWsService } from './messages-ws.service';
import { MessagesWsGateway } from './messages-ws.gateway';

import { AuthModule } from '../auth/auth.module';
import { ConversationModule } from 'src/conversation/conversation.module';
import { MessagesModule } from 'src/messages/messages.module';
import { AuthService } from 'src/auth/auth.service';

@Module({
  providers: [MessagesWsGateway, MessagesWsService, AuthService],
  imports: [AuthModule, ConversationModule, MessagesModule],
})
export class MessagesWsModule {}
