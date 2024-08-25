import { Socket } from 'socket.io';

export interface JwtSocket extends Socket{
    user: {userId: string, username: string}
}