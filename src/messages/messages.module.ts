import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { ConversationModule } from 'src/conversation/conversation.module';
import { User } from 'src/auth/entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, Conversation, User]),
    ConversationModule,
    AuthModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService, AuthService],
  exports: [MessagesService],
})
export class MessagesModule {}
