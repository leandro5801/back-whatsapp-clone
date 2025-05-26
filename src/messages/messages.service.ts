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
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly repositoryMessage: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly repositoryConversation: Repository<Conversation>,
    @InjectRepository(User)
    private readonly repositoryUser: Repository<User>,

    private readonly conversationService: ConversationService,
  ) {}

  async create(
    createMessageDto: CreateMessageDto,
    sender: User,
  ): Promise<Message> {
    const { id_conversation } = createMessageDto;
    const conversation = await this.conversationService.findOneById(
      id_conversation,
    );
    console.log(conversation);

    const memberExist = conversation.members.some(
      (member) => member.id === sender.id,
    );

    if (!memberExist)
      throw new BadRequestException(
        'User is not in the conversation you provided',
      );
    const newMessage = this.repositoryMessage.create({
      ...createMessageDto,
      sender,
    });
    newMessage.conversation = conversation;
    newMessage.sender = sender;
    const savedMessage = await this.repositoryMessage.save(newMessage);
    return {
      ...savedMessage,
      conversation: { id: conversation.id } as Conversation,
    };
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
      order: { createdAt: 'ASC' },
      relations: ['sender'],
    });

    return messages;
  }
  async findLastMessage(conversationId: string): Promise<Message | null> {
    if (!isUUID(conversationId)) {
      throw new BadRequestException('Invalid conversation ID');
    }

    const lastMessage = await this.repositoryMessage.find({
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'DESC' },
      take: 1,
    });

    return lastMessage.length > 0 ? lastMessage[0] : null;
  }

  async update(id: string, updateMessageDto: UpdateMessageDto): Promise<void> {
    const messageFind = await this.repositoryMessage.findOne({
      where: { id },
    });
    if (!messageFind) {
      throw new NotFoundException(`Message with ${id} not found`);
    }
    const { id_conversation, message, isModified } = updateMessageDto;
    console.log(messageFind);

    await this.repositoryMessage.save({
      ...messageFind,
      id_conversation,
      message,
      isModified,
    });
  }

  async remove(id: string): Promise<void> {
    const message = await this.findOneMessage(id);
    await this.repositoryMessage.remove(message);
  }
}
