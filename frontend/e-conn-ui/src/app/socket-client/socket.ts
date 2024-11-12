import { io, Socket } from 'socket.io-client';
// const URL: string = "http://localhost:6969";
const URL: string = "https://e-conn-production.up.railway.app";
const socket: Socket = io(URL, {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket', 'polling'],
});
export default socket;