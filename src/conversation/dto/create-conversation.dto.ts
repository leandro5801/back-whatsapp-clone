import { IsArray, IsObject, IsOptional, IsString } from "class-validator";
import { User } from "src/auth/entities/user.entity";

export class CreateConversationDto {
    @IsArray()
    members: User[];
    
    @IsOptional()
    @IsString()
    name_conversation?:string
}
