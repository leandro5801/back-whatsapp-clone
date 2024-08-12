import { IsNotEmpty, IsObject, IsString, IsUUID } from "class-validator";
import { User } from "src/auth/entities/user.entity";

export class CreateMessageDto {
    @IsString()
    @IsUUID()
    @IsNotEmpty()
    id_conversation: string;

    @IsString()
    @IsNotEmpty()
    message: string;

    @IsObject()
    sender: User;
}
