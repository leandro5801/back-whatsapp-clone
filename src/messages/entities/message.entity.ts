import { User } from "src/auth/entities/user.entity";
import { Conversation } from "src/conversation/entities/conversation.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conversation, (conversation) => conversation.id,)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({type:'text'})
  message: string;

  @ManyToOne(() => User, (user)=> user.id,) 
  @JoinColumn({ name: 'sender_id' })
  sender: User; 


  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
