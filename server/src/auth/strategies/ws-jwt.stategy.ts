import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { WsException } from '@nestjs/websockets';
import { UserService } from 'src/user/user.service';
import { jwtConstants } from '../constants';

@Injectable()
export class WsJwtStrategy extends PassportStrategy(Strategy, 'wsjwt') {
  constructor(
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: (req) => { 
        const token = req.handshake?.query?.bearerToken
        if(!token){
            throw new WsException('Token not found')
        }
        return token
        },
      ignoreExpiration:false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    const { sub: userId, username } = payload
    const user = await this.userService.findOne(undefined, username, undefined);
    if(user){
      return { userId, username }
    }
    throw new WsException('Unauthorized access');
  }
}