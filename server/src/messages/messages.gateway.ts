import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Server, Socket } from 'socket.io'
import { OnModuleInit, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtSocket } from './jwt.socket';

@UseGuards(AuthGuard('wsjwt'))
@WebSocketGateway({cors: {
  origin: ['http://localhost:5173']
}})
export class MessagesGateway implements OnModuleInit {

  @WebSocketServer()
  server: Server

  onModuleInit() {
    this.server.on('connection', (socket) => {
    })
  }

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('createMessage')
  async create(@MessageBody() body: string, @ConnectedSocket() client: JwtSocket) {
    const user = client.user
    const ret = await this.messagesService.create(body, user)
    this.server.emit('onMessage', {
      id: ret.id,
      content: ret.content,
      createdAt: ret.createdAt,
      userId: user.userId,
      user: {
        username: user.username
      },
    })
    return ret
  }
}
