import { Socket } from 'socket.io';

//to be able to get user in client.user in gateway

export interface JwtSocket extends Socket{
    user: {userId: string, username: string}
}