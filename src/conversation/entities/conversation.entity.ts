import { User } from 'src/auth/entities/user.entity';
import { Message } from 'src/messages/entities/message.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', default: '' })
  name_conversation: string;

  @ManyToMany(() => User, (user) => user.id, { eager: true })
  @JoinTable({
    name: 'conversations_users',
    joinColumn: {
      name: 'conversation_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
  })
  members: User[];

  @OneToMany(() => Message, (message) => message.id, { cascade: true })
  messages: Message[];
}
