import { Injectable, NotFoundException, Req } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoomsService } from 'src/rooms/rooms.service';

@Injectable()
export class MessagesService {

  constructor(private prisma: PrismaService, private roomsService: RoomsService) { }

  async create(message: string, roomId:string, user: any) {
    
    const data: Prisma.MessageCreateInput = {
      content: message,
      user: {
        connect: { id: user.userId }
      },
      room: {
        connect: {id: roomId}
      }
    }
    return await this.prisma.message.create({
      data
    })
  }

  async findAll(roomId: string) {
    return await this.prisma.message.findMany({
      take: 50,
      where:{
        roomId: roomId
      },
      include: { 
        user: {
          select: {
            username: true
          }
      } },
      orderBy: { createdAt: 'desc'},
    })
  }
}
