import { createContext } from "react";
import { io, Socket } from "socket.io-client";

const queryParams = new URLSearchParams({
    bearerToken: (sessionStorage.getItem('token') as string),  
  });
  
export const socket = io(`http://localhost:3000?${queryParams.toString()}`)
export const WebsocketContext = createContext<Socket>(socket)
export const WebsocketProvider = WebsocketContext.Provider