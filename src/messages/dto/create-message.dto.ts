import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsString,
  IsUUID,
} from 'class-validator';
import { User } from 'src/auth/entities/user.entity';

export class CreateMessageDto {
  @IsString()
  @IsUUID()
  @IsNotEmpty()
  id_conversation: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  sender: string;

  @IsBoolean()
  isModified?: boolean;
}
