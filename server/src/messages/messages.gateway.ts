import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, ConnectedSocket } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Server, Socket } from 'socket.io'
import { BadRequestException, Body, NotFoundException, OnModuleInit, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtSocket } from './jwt.socket';
import { RoomsService } from 'src/rooms/rooms.service';
import { NotFoundError } from 'rxjs';

@UseGuards(AuthGuard('wsjwt'))
@WebSocketGateway({cors: {
  origin: ['http://localhost:5173']
}})
export class MessagesGateway implements OnModuleInit {
  
  constructor(private readonly messagesService: MessagesService, private readonly roomsService: RoomsService) {}

  @WebSocketServer()
  server: Server

  onModuleInit() {
    this.server.on('connection', (socket) => {
    })
  }


  @SubscribeMessage('createMessage')
  async create(@MessageBody() body: {message: string, roomId: string}, @ConnectedSocket() client: JwtSocket) {
    const room = await this.roomsService.findOne(body.roomId)
    if(!room){
      throw new NotFoundException('Room does not exist')
    }
    const user = client.user
    const ret = await this.messagesService.create(body.message, body.roomId, user)
    this.server.to(body.roomId).emit('onMessage', {
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

  @SubscribeMessage('joinRoom')
  async joinRoom(@MessageBody() body: string, @ConnectedSocket() client: JwtSocket){
    client.join(body)
  }

}
