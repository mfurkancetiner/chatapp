import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NotFoundError } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class RoomsService {

  constructor(private prisma: PrismaService) { }

  async create(createRoomDto: Prisma.RoomCreateInput) {
    return await this.prisma.room.create({
      data: createRoomDto
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where:{
        id
      }
    })
    if(!room){
      return null
    }
    return room
  }

  async remove(id: string) {
    const user = this.findOne(id)
    if(!user)
      throw new NotFoundException('User does not exist')
    return await this.prisma.room.delete({
      where:{
        id
      }
    })
  }
}
