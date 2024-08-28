import { Controller, Get, Param } from '@nestjs/common';
import { MessagesService } from './messages.service';

@Controller('messages/:id')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Get()
    fetchMessages(@Param('id') id: string){
        return this.messagesService.findAll(id)
    }
}
