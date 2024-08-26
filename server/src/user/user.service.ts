import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {

  constructor(private prisma: PrismaService) { }

  async create(createUserDto: Prisma.UserCreateInput) {
    const existingUser = await this.prisma.user.findFirst({
      where:{
        OR: [
          { email: createUserDto.email},
          { username: createUserDto.username}
        ]
      }
    })

    if(existingUser){
      if(existingUser.username === createUserDto.username){
        throw new ConflictException('This username is in use')
      }
      throw new ConflictException('This email is in use')
    }

    const saltOrRounds = 10;
    const password = createUserDto.password;
    const hash = await bcrypt.hash(password, saltOrRounds);
    createUserDto.password = hash

    const created = await this.prisma.user.create({
      data:createUserDto
    })
    return created
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      where:{}
    })
    return users.map(({ password, ...user }) => user);

  }

  async findOne(id?: number, username?: string, email?: string) {
    if(!id && !username && !email)
      throw new BadRequestException('Provide id, username or email')
    const user = await this.prisma.user.findFirst({
      where:{
        OR: [
          {id},
          {username},
          {email}
        ]
      }
    })
    if(!user){
      throw new NotFoundException(`User not found`)
    }
    return user
  }

  async update(id: number, updateUserDto: Prisma.UserUpdateInput) {
    const user = await this.findOne(id)
    if(!user){
      throw new NotFoundException(`User with id ${id} not found`)
    }
    const updated = this.prisma.user.update({
      where:{id},
      data:updateUserDto
    })
    return updated
  }

  async remove(id: number) {
    const user = await this.findOne(id)
    if(!user){
      throw new NotFoundException(`User with id ${id} not found`)
    }
    const removed = this.prisma.user.delete({
      where:{id},
    })
    return removed
  }
}
