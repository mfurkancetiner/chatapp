import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { PrismaService } from 'src/prisma/prisma.service';
import { MessagesController } from './messages.controller';

@Module({
  providers: [MessagesGateway, MessagesService, PrismaService],
  controllers: [MessagesController],
})
export class MessagesModule {}
