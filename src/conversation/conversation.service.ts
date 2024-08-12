import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Message } from 'src/messages/entities/message.entity';
import { isUUID } from 'class-validator';

@Injectable()
export class ConversationService {
  @InjectRepository(Conversation)
  private readonly repositoryConversation: Repository<Conversation>;

  @InjectRepository(User)
  private readonly repositoryUser: Repository<User>;

  async create(createConversationDto: CreateConversationDto) {
    const { members } = createConversationDto;
    console.log(members);

    if (members.length === 0)
      throw new BadRequestException(
        'Conversation must have at least one member',
      );

    // TODO Verify MEMBERS must be unique

    const users = await this.getMembers(members);

    const newConversation = this.repositoryConversation.create(
      createConversationDto,
    );
    newConversation.members = users;
    return this.repositoryConversation.save(newConversation);
  }

  async findAll() {
    return await this.repositoryConversation.find();
  }
  async findAllByUsername(id: string) {
    try {
      const user = await this.repositoryUser.findOneBy({id:id})
      if (!user) throw new BadRequestException('User not found');
      const conversations = await this.repositoryConversation.find({
        where: { members: user },
      });
      console.log(conversations);
      
      if (conversations.length === 0) return conversations;
      const conversations_user =  await Promise.all(
        conversations.map(async (conversation: Conversation) => {
          let result = await this.findOneById(conversation.id);
          return result;
        }),
      );
      return conversations_user;
    } catch (error) {
      throw new InternalServerErrorException('Error al buscar conversaciones por username', error);
    }
  }

  async findOneById(id: string) {
    if (!isUUID(id)) throw new BadRequestException('Not is a correct id');
    const conversation = await this.repositoryConversation.findOneBy({ id });

    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }
    return conversation;
  }

  async update(id: string, updateConversationDto: UpdateConversationDto) {
    const conversation = await this.repositoryConversation.findOneBy({ id });
    console.log(conversation);

    if (!conversation) {
      throw new BadRequestException('Conversation not found');
    }
    const members = await this.getMembers(updateConversationDto.members);

    conversation.members = members;
    conversation.name_conversation = updateConversationDto.name_conversation
      ? updateConversationDto.name_conversation
      : conversation.name_conversation;

    return this.repositoryConversation.save(conversation);
  }

  async remove(id: string) {
    if (!isUUID(id)) throw new BadRequestException('Not is a correct id');
    const conversation = await this.repositoryConversation.findOneBy({ id });
    if (!conversation) throw new BadRequestException('Conversation not found');
    await this.repositoryConversation
      .createQueryBuilder('conversation')
      .delete()
      .from(Message)
      .where('conversation.id = :id', { id: conversation.id })
      .execute();

    await this.repositoryConversation.delete({ id: conversation.id });
  }

  async getMembers(members: User[]) {
    const users: User[] = await Promise.all(
      members.map(async (memberId) => {
        const user = await this.repositoryUser.findOneBy({
          username: memberId.username,
        });

        if (!user || memberId.fullName !== user.fullName) {
          throw new BadRequestException(
            `Member ${memberId.fullName} with username ${memberId.username} does not exist`,
          );
        }
        return {
          fullName: user.fullName,
          username: user.username,
          id: user.id,
        } as User;
      }),
    );
    return users;
  }
}
