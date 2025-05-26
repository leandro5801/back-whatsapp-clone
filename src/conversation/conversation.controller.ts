import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

import { GetUser } from 'src/auth/decorators';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/valid-roles';
import { User } from 'src/auth/entities/user.entity';

@Controller('conversation')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  create(@Body() createConversationDto: CreateConversationDto) {
    return this.conversationService.create(createConversationDto);
  }
  @Auth(ValidRoles.user)
  @Get('/username')
  findByUser(@GetUser() user: User) {
    return this.conversationService.findAllByUsername(user);
  }

  @Auth(ValidRoles.user)
  @Get('/not/username')
  findContactsUser(@GetUser() user: User) {
    return this.conversationService.findAllWithoutUsername(user);
  }

  @Get()
  findAll() {
    return this.conversationService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationService.findOneById(id);
  }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationService.update(id, updateConversationDto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversationService.remove(id);
  }
}
