import express, { NextFunction, Request, Response } from "express";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import dotenv from "dotenv";

import { PSocket } from "./interfaces/common.interface";
import authRouter from "./routes/auth.route";
import * as db from "./db/db-client";
import initializeAllTables from "./db/db-init";
import { errorHandler } from "./utils/errorHandler.util";

dotenv.config({ debug: true, });
const PORT: number = Number.parseInt(process.env.production || "6969");
const app = express();
const server = createServer(app);
const pgStore = pgSession(session);

declare module 'express-session' {
    interface Session {
        userData?: {
            userId?: string,
            username?: string;
        };
    }
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({
    origin: "http://localhost:4200",
    optionsSuccessStatus: 200,
    credentials: true
}));

const io = new Server(server, {
    cors: {
        origin: "http://localhost:4200"
    }
});

app.use(session({
    name: "SSID",
    secret: "secret",
    saveUninitialized: false,
    resave: false,
    cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "strict",
    },
    store: new pgStore({
        pool: db.pool,
        schemaName: "e-conn-app",
        tableName: "sessions",
        createTableIfMissing: true,
    })
}));

app.get("/", async (req, res, next) => {
    let result = (await db.query(`SELECT * FROM "e-conn-app".sessions`)).rows;
    console.log(req.session.id);
    res.json({ msg: "Hello", result });
    next();
});
app.get("/api/v1/db-init", async (req: Request, res: Response, next: NextFunction) => {
    await initializeAllTables();
    res.json({ msg: "All tables created" });
    console.log("All tables created");
    next();
});
app.use("/api/v1/auth", authRouter);

io.on('connection', (socket: Socket) => {
    console.log('a user connected', socket.id);
    socket.on("post-message", (message) => {
        console.log(message);
        io.emit("post-message", [message, socket.id]);
    });
});

io.use((socket: PSocket, next) => {
    const username = socket.handshake.auth.username;
    if (!username) {
        return next(new Error("username not found"));
    }
    socket.username = username;
    next();
});

app.use(errorHandler);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});