import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Get()
  findAll() {
    return this.messagesService.findAll();
  }
/* 
  @Get(':idConversation/:idMessage')
  findOne(@Param('idConversation') idConversation: string, @Param('idMessage') idMessage: string ) {
    return this.messagesService.findOneMessageByConversation(idConversation,idMessage);
  }
 */
  @Get('/:idConversation/messages')
  findAllMessagesByConversation(@Param('idConversation',ParseUUIDPipe) idConversation:string){
    return this.messagesService.findMessagesByConversation(idConversation)
  }
  @Get('/:idMessage')
  findMessage(@Param('idMessage',ParseUUIDPipe) idMessage:string){
    return this.messagesService.findOneMessage(idMessage)
  }

  @Patch(':id')
  updateMessage(@Param('id',ParseUUIDPipe) id: string, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(id, updateMessageDto);
  }

  @Delete(':id')
  removeMessage(@Param('id',ParseUUIDPipe) id: string) {
    return this.messagesService.remove(id);
  }
}
