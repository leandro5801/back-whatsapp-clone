import { Conversation } from 'src/conversation/entities/conversation.entity';
import { Message } from 'src/messages/entities/message.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  username: string;

  @Column('text', {
    select: false,
  })
  password: string;

  @Column('text')
  fullName: string;

  @Column('bool', {
    default: false,
  })
  isActive: boolean;

  @ManyToMany(() => Conversation, (conversation) => conversation.members, {
    cascade: true,
  })
  conversations: Conversation[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @Column({ default: '' })
  socketId: string;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    if (this.conversations === undefined) this.conversations = [];
  }

  /* @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();   
    } */
}
