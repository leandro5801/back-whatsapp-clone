import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { In, Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Message } from 'src/messages/entities/message.entity';
import { isUUID } from 'class-validator';
import { MessagesService } from 'src/messages/messages.service';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly repositoryConversation: Repository<Conversation>,
    @InjectRepository(User)
    private readonly repositoryUser: Repository<User>,
  ) {}
  async create(createConversationDto: CreateConversationDto) {
    const { members } = createConversationDto;

    if (members.length === 0)
      throw new BadRequestException(
        'Conversation must have at least one member',
      );

    // TODO Verify MEMBERS must be unique

    await this.getMembers(members);
    const newConversation = this.repositoryConversation.create(
      createConversationDto,
    );
    return this.repositoryConversation.save(newConversation);
  }

  async findAll() {
    return await this.repositoryConversation.find();
  }

  async findAllContacts(user: User) {
    const contactsWithoutUser = await this.repositoryConversation.find({
      relations: ['members'],
      where: {
        name_conversation: '',
        members: In[user.id],
      },
    });

    return contactsWithoutUser;
  }
  async findAllByUsername(user: User) {
    const conversations = await this.repositoryConversation.find({
      where: { members: In[user.id] },
      relations: ['members', 'messages'],
    });

    if (conversations.length === 0) return conversations;
    const conversationsMapped = conversations.map((conversation) => {
      const lastMessage = conversation.messages.sort((a, b) => {
        conversation.members = conversation.members.filter(
          (member) => member.id !== user.id,
        );
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      })[0];

      return {
        ...conversation,
        messages: lastMessage ? [lastMessage] : [],
      };
    });

    return conversationsMapped;
  }

  async findAllWithoutUsername(user: User) {
    const users = await this.repositoryUser.find();
    const contactsWithoutUser = await this.findAllContacts(user);
    /* console.log(contactsWithoutUser); */

    const result = users.filter(
      (userResult) =>
        !contactsWithoutUser.some((contact) =>
          contact.members.some((member) => member.id === userResult.id),
        ),
    );
    /* for (const key of result) {
      console.log(key);
    } */

    return result;
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
    let members: User[];
    if (updateConversationDto.members)
      members = await this.getMembers(updateConversationDto.members);

    conversation.members = members;
    conversation.name_conversation = updateConversationDto.name_conversation;

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
