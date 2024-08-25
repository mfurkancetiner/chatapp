import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Prisma } from '@prisma/client';
import { Server, Socket } from 'socket.io'
import { OnModuleInit, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtSocket } from './jwt.socket';

@UseGuards(AuthGuard('wsjwt'))
@WebSocketGateway({cors: true})
export class MessagesGateway implements OnModuleInit {

  @WebSocketServer()
  server: Server

  onModuleInit() {
    this.server.on('connection', (socket) => {
    })
  }

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('createMessage')
  async create(@MessageBody() message: string, @ConnectedSocket() client: JwtSocket) {
    const user = client.user
    const ret = await this.messagesService.create(message, user)
    this.server.emit('message', {
      user: user,
      msg: message
    })
    return ret
  }

  @SubscribeMessage('findAllMessages')
  async findAll() {
    return this.messagesService.findAll();
  }
}
