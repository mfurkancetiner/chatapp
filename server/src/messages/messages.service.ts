import { Injectable, Req } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MessagesService {

  constructor(private prisma: PrismaService) { }

  async create(message: string, user: any) {
    const data: Prisma.MessageCreateInput = {
      content: message,
      user: {
        connect: { id: user.userId }
      }
    }
    return this.prisma.message.create({
      data
    })
  }

  async findAll() {
    return this.prisma.message.findMany({
      take: 50,
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
