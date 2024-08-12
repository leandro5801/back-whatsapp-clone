import { Conversation } from 'src/conversation/entities/conversation.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
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

  @ManyToMany(() => Conversation, (conversation) => conversation.members,{cascade:true})  
  conversations: Conversation[];

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @Column({default:""})
  socketId: string;

  /* @BeforeInsert()
    checkFieldsBeforeInsert() {
        
    }

    @BeforeUpdate()
    checkFieldsBeforeUpdate() {
        this.checkFieldsBeforeInsert();   
    }
*/
}
