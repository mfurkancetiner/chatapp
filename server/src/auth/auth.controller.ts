import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';

@Throttle({ short: { limit: 2, ttl: 1000 }, long: { limit: 5, ttl: 60000 } })
@UseGuards(AuthGuard('local'))
@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }


    @Post('login')
    async login(@Req() req: Request){
        return this.authService.login(req.user)
    }
}
