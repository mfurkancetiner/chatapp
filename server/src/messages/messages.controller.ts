import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('messages/:id')
export class MessagesController {
    constructor(private readonly messagesService: MessagesService) {}

    @Get()
    fetchMessages(@Param('id') id: string){
        return this.messagesService.findAll(id)
    }
}
