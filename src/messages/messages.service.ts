import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';
import { Conversation } from 'src/conversation/entities/conversation.entity';
import { ConversationService } from 'src/conversation/conversation.service';
import { isUUID } from 'class-validator';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly repositoryMessage: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly repositoryConversation: Repository<Conversation>,

    private readonly conversationService: ConversationService,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const { id_conversation, sender } = createMessageDto;
    const conversation = await this.conversationService.findOneById(
      id_conversation,
    );
    console.log(conversation);

    const memberExist = conversation.members.some(
      (member) => member.id === sender.id,
    );
    console.log(memberExist);

    if (!memberExist)
      throw new BadRequestException(
        'User is not in the conversation you provided',
      );
    const newMessage = this.repositoryMessage.create(createMessageDto);
    newMessage.conversation = conversation;
    const savedMessage = await this.repositoryMessage.save(newMessage);
    return {...savedMessage, conversation:{id: savedMessage.id} as Conversation}
  }

  async findAll(): Promise<Message[]> {
    return await this.repositoryMessage.find({
      loadRelationIds: {
        relations: ['sender', 'conversation'],
        disableMixedMap: true,
      },
    });
  }

  async findOneMessage(idMessage: string): Promise<Message> {
    const message = await this.repositoryMessage.findOne({
      where: { id: idMessage },
      loadRelationIds: {
        relations: ['conversation', 'sender'],
        disableMixedMap: true,
      },
    });
    if (!message)
      throw new NotFoundException(`Message with ${idMessage} not found`);
    return message;
  }

  /*   async findOneMessageByConversation(
    id_message: string,
    id_conversation: string,
  ): Promise<Message> {
    const AllMessages = await this.findMessagesByConversation(id_conversation);
    const message = AllMessages.find((message) => message.id === id_message);
    if (!message)
      throw new NotFoundException(`Message with ${id_message} not found`);
    return message;
  }
 */
  async findMessagesByConversation(
    id_conversation: string,
  ): Promise<Message[]> {
    const messages = await this.repositoryMessage.find({
      where: { conversation: { id: id_conversation } },
      loadRelationIds: {
        relations: ['conversation'],
        disableMixedMap: true,
      },
    });
    console.log(messages);

    return messages;
  }

  async update(id: string, updateMessageDto: UpdateMessageDto): Promise<void> {
      const message = await this.repositoryMessage.findOne({
        where: { id },
      });
      if (!message) {
        throw new NotFoundException(`Message with ${id} not found`);
      }
  
    await this.repositoryMessage.save({
        ...message,
        ...updateMessageDto,
      });
    
    
  }

  async remove(id: string): Promise<void> {
    
      const message = await this.findOneMessage(id);
      await this.repositoryMessage.remove(message);
    
    
  }
}
