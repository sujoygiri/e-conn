import express, { NextFunction, Request, Response } from "express";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import dotenv from "dotenv";
dotenv.config({ debug: true, });

// import { PSocket } from "./interfaces/common.interface";
import * as db from "./db/db-client";
import initializeAllTables from "./db/db-init";
import { errorHandler } from "./utils/errorHandler.util";
import authRouter from "./routes/auth.route";
import utilRouter from "./routes/util.route";
// import { SuccessResponse } from "./interfaces/common.interface";

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

const sessionMiddleware = session({
    name: "SSID",
    secret: "secret",
    saveUninitialized: false,
    resave: false,
    rolling: true,
    cookie: {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "none",
        secure: "auto",
    },
    store: new pgStore({
        pool: db.pool,
        schemaName: "e-conn-app",
        tableName: "sessions",
        createTableIfMissing: true,
    })
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: ["http://localhost:4200", "https://e-conn.pages.dev", "https://e-conn.netlify.app"],
    optionsSuccessStatus: 200,
    credentials: true
}));
app.use(sessionMiddleware);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/util", utilRouter);
app.get("/", async (req, res, next) => {
    let result = (await db.query(`SELECT NOW()`)).rows;
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
app.use(errorHandler);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:4200", "https://e-conn.pages.dev", "https://e-conn.netlify.app"],
        credentials: true,
    }
});

// io.use((socket: PSocket, next) => {
//     const username = socket.handshake.auth.username;
//     if (!username) {
//         return next(new Error("username not found"));
//     }
//     socket.username = username;
//     next();
// });
io.engine.use(sessionMiddleware);
io.on("connection", async (socket: Socket) => {
    const req = socket.request as Request;
    const userId = socket.handshake.auth.userId;
    console.log('a user connected with session id: ', req.session.id);
    await socket.join(userId);
    await socket.join("global");
    socket.on("global-chats", async ({ data }) => {
        io.to("global").emit("get-global-chats", { message: 'hello from global', data });
    });
    socket.on("individual-chats", async ({ sender_id, receiver_id, limit, offset }) => {
        const getChatsQueryString = `SELECT "e-conn-app".chats.chat_id,"e-conn-app".chats.content,"e-conn-app".chats.sender_id,"e-conn-app".chats.receiver_id,"e-conn-app".chats.created_at,"e-conn-app".chat_status.is_read FROM "e-conn-app".chats LEFT JOIN "e-conn-app".chat_status ON "e-conn-app".chats.chat_id = "e-conn-app".chat_status.chat_id WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at ASC LIMIT $3 OFFSET $4`;
        const getChatsQueryResult = await db.query(getChatsQueryString, [sender_id, receiver_id, limit, offset]);
        socket.emit("get-individual-chats", getChatsQueryResult.rows);
    });
    socket.on("private-message", async ({ message, to }) => {
        const chatStoreQueryString = `INSERT INTO "e-conn-app".chats (content,sender_id,receiver_id) VALUES ($1,$2,$3) RETURNING chat_id, created_at`;
        const chatStoreQueryResult = await db.query(chatStoreQueryString, [message, userId, to]);
        if (chatStoreQueryResult.command === "INSERT" && chatStoreQueryResult.rowCount === 1) {
            io.to(to).to(userId).emit("private-message", { message, messageId: chatStoreQueryResult.rows[0].chat_id, from: userId, to, createdAt: chatStoreQueryResult.rows[0].created_at });
            const updateChatStatusQueryString = `INSERT INTO "e-conn-app".chat_status (chat_id,user_id) VALUES ($1,$2)`;
            await db.query(updateChatStatusQueryString, [chatStoreQueryResult.rows[0].chat_id, to]);
        }
    });
    socket.on("add-connection", async ({ user_id, connected_user_id }) => {
        const connectionQueryString = `INSERT INTO "e-conn-app".user_connections (user_id,connected_user_id) VALUES ($1,$2)`;
        const connectionQueryResult = await db.query(connectionQueryString, [user_id, connected_user_id]);
        if (connectionQueryResult.command === "INSERT" && connectionQueryResult.rowCount === 1) {
            let connectionSuccessResponse = {
                message: "Connection added",
                status: "success",
                statusCode: 200,
                userId: user_id
            };
            socket.emit("add-connection", connectionSuccessResponse);
        }
    });
    socket.on("search-connection", async ({ userId }) => {
        const connectionSearchQueryString = `SELECT "e-conn-app".user_connections.connected_user_id, "e-conn-app".users.username, "e-conn-app".users.email FROM "e-conn-app".user_connections LEFT JOIN "e-conn-app".users ON "e-conn-app".user_connections.connected_user_id = "e-conn-app".users.user_id WHERE "e-conn-app".user_connections.user_id = $1`;
        const connectionSearchQueryResult = await db.query(connectionSearchQueryString, [userId]);
        if (connectionSearchQueryResult.command === "SELECT" && connectionSearchQueryResult.rowCount as number > 0) {
            let connectionSearchSuccessResponse = {
                message: "Connection found",
                status: "success",
                statusCode: 200,
                userId,
                users: connectionSearchQueryResult.rows
            };
            socket.emit("get-connections", connectionSearchSuccessResponse);
        }
    });
    socket.on("message-read", async ({ byWho, sender }) => {
        const updateMessageReadQueryString = `UPDATE "e-conn-app".chat_status SET is_read = true WHERE is_read = false AND user_id = $1`;
        const updateMessageReadQueryResult = await db.query(updateMessageReadQueryString, [byWho]);
        if (updateMessageReadQueryResult.command === "UPDATE" && updateMessageReadQueryResult.rowCount as number >= 1) {
            io.to(sender).emit("message-read", { byWho, sender });
        }
    });
    socket.on("fetch-latest-messages", async ({ userId }) => {
        const getLatestMessagesQueryString = `SELECT * FROM "e-conn-app".chats WHERE created_at > (SELECT last_seen FROM "e-conn-app".users WHERE user_id = $1) AND receiver_id = $1 ORDER BY created_at DESC LIMIT 10`;
        const getLatestMessagesQueryResult = await db.query(getLatestMessagesQueryString, [userId]);
        socket.emit("get-latest-messages", getLatestMessagesQueryResult.rows);
    });
    socket.on("disconnect", async (reason) => {
        const updateUserLastSeenQueryString = `UPDATE "e-conn-app".users SET last_seen = NOW() WHERE user_id = $1`;
        await db.query(updateUserLastSeenQueryString, [userId]);
    });
});
// io.on("connect_error", (err) => {
//     console.log(`Connection error: ${err.message}`);
// });

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});