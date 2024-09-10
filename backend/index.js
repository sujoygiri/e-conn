import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import cors from "cors";

const PORT = 6969 || process.env.production;
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200"
    }
});

app.use(cors({
    origin: "http://localhost:4200",
    optionsSuccessStatus: 200,
}));

app.get("/", (req, res, next) => {
    res.json({ msg: "Hello World" });
});


io.on('connection', (socket) => {
    console.log('a user connected', socket.id);
    socket.on("post-message", (message) => {
        console.log(message);
        io.emit("post-message", [message, socket.id]);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});