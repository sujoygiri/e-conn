import { io, Socket } from 'socket.io-client';
import { configData } from '../utils/data.util';
const socket: Socket = io(configData.hostURL, {
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket', 'polling'],
});
export default socket;