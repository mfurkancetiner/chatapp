import React, { useEffect, useState } from 'react';
import { createContext } from "react";
import { io, Socket } from "socket.io-client";

interface WebsocketContextType {
  socket: Socket | null;
}

export const WebsocketContext = createContext<WebsocketContextType>({ socket: null });

export const WebsocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      const queryParams = new URLSearchParams({ bearerToken: token });
      const newSocket = io(`http://localhost:3000?${queryParams.toString()}`);
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, []); 

  return (
    <WebsocketContext.Provider value={{ socket }}>
      {children}
    </WebsocketContext.Provider>
  );
};
