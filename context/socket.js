import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => { //hook
    const socket = useContext(SocketContext)
    return socket
}

export const SocketProvider = (props) => {
  const { children } = props;
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // const connection = io();//monorepo so no server URL
    const isDev = process.env.NODE_ENV === 'development';
    const URL = isDev ? 'http://localhost:5000' : 'https://deploy-voicecall-backend.onrender.com'
    const connection = io(URL);
    console.log("socket connection", connection)
    setSocket(connection);
  }, []);

  socket?.on('connect_error', async (err) => { // as this is a monorepo so expicitly called API
    console.log("Error establishing socket", err)
    // await fetch('/api/socket')
    const connection = io(URL);
    setSocket(connection);
  })

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
