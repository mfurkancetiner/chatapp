import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private userService: UserService, private jwtService: JwtService){ }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.userService.findOne(undefined, username, undefined);
        const isMatch = await bcrypt.compare(pass, user?.password);
        if (isMatch) {
          const { password, ...result } = user;
          return result;
        }
        return null;
    }

    async login(user: any): Promise<{access_token:string}> {
        const payload = { sub:user.id, username: user.username }
        return {
            access_token: await this.jwtService.signAsync(payload),
        }
    }
}
