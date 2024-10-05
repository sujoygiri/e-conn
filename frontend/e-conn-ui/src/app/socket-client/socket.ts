import { io, Socket } from 'socket.io-client';
const URL: string = "http://localhost:6969";
const socket: Socket = io(URL, { autoConnect: false });
export default socket;