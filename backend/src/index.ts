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
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
    },
    store: new pgStore({
        pool: db.pool,
        schemaName: "e-conn-app",
        tableName: "sessions",
        createTableIfMissing: true,
    })
});
app.set('trust proxy', 1);
app.use(cors({
    origin: ["https://e-conn.pages.dev", "https://e-conn.netlify.app", "http://localhost:4200"],
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    preflightContinue: false,
    maxAge: 7 * 24 * 60 * 60 * 1000
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(sessionMiddleware);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/util", utilRouter);
app.get("/", async (req, res, next) => {
    let result = (await db.query(`SELECT NOW()`)).rows;
    console.log(req.session.id);
    res.cookie("_session", req.session.id, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }).json({ msg: "Hello", result });
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
        const getChatsQueryString = `SELECT "e-conn-app".chats.chat_id,"e-conn-app".chats.content,"e-conn-app".chats.sender_id,"e-conn-app".chats.receiver_id,"e-conn-app".chats.created_at,"e-conn-app".chats.is_read FROM "e-conn-app".chats WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at ASC LIMIT $3 OFFSET $4`;
        const getChatsQueryResult = await db.query(getChatsQueryString, [sender_id, receiver_id, limit, offset]);
        socket.emit("get-individual-chats", getChatsQueryResult.rows);
    });
    socket.on("private-message", async ({ messageId, message, to, created_at }, callback) => {
        const chatStoreQueryString = `INSERT INTO "e-conn-app".chats (chat_id,content,sender_id,receiver_id,created_at) VALUES ($1,$2,$3,$4,$5) RETURNING chat_id, created_at`;
        const chatStoreQueryResult = await db.query(chatStoreQueryString, [messageId, message, userId, to, created_at]);
        if (chatStoreQueryResult.command === "INSERT" && chatStoreQueryResult.rowCount === 1) {
            socket.to(to).emit("private-message", { message, messageId: chatStoreQueryResult.rows[0].chat_id, from: userId, to, createdAt: chatStoreQueryResult.rows[0].created_at });
            callback({ message: "Message sent", status: "success", statusCode: 200, messageId: chatStoreQueryResult.rows[0].chat_id });
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
    socket.on("message-read", async ({ byWho, sender }) => {
        const updateMessageReadQueryString = `UPDATE "e-conn-app".chats SET is_read = true WHERE is_read = false AND receiver_id = $1 AND sender_id = $2`;
        const updateMessageReadQueryResult = await db.query(updateMessageReadQueryString, [byWho, sender]);
        if (updateMessageReadQueryResult.command === "UPDATE" && (updateMessageReadQueryResult.rowCount ?? 0) >= 1) {
            io.to(sender).emit("message-read", { byWho, sender });
        }
    });
    socket.on("get-connected-people-messages", async ({ userId }) => {

        const getConnectedPeopleAndMessageQueryString = `WITH all_connected_people AS (SELECT uc.connected_user_id,u.username,u.email FROM "e-conn-app".user_connections uc LEFT JOIN "e-conn-app".users u ON uc.connected_user_id = u.user_id WHERE uc.user_id = $1) SELECT acp.connected_user_id, acp.username, acp.email, latest_chat.content AS last_message, COALESCE(unread_chat.total_unread, 0) AS total_unread_chats, latest_chat.created_at AS last_message_time FROM all_connected_people acp LEFT JOIN LATERAL (SELECT content, created_at FROM "e-conn-app".chats WHERE (sender_id = $1 AND receiver_id = acp.connected_user_id) OR (sender_id = acp.connected_user_id AND receiver_id = $1) ORDER BY created_at DESC LIMIT 1) latest_chat ON true LEFT JOIN (SELECT sender_id, receiver_id, COUNT(*) AS total_unread FROM "e-conn-app".chats WHERE is_read = false GROUP BY sender_id, receiver_id) unread_chat ON unread_chat.sender_id = acp.connected_user_id AND unread_chat.receiver_id = $1 ORDER BY latest_chat.created_at DESC LIMIT 10 OFFSET 0`;

        let queryStart = new Date().getTime();
        const getConnectedPeopleAndMessage = await db.query(getConnectedPeopleAndMessageQueryString, [userId]);
        console.log(`getConnectedPeopleAndMessage: ${new Date().getTime() - queryStart} ms`);
        if (getConnectedPeopleAndMessage.command === "SELECT" && (getConnectedPeopleAndMessage.rowCount ?? 0) > 0) {
            let connectionDetails = {
                message: "Connection found",
                status: "success",
                statusCode: 200,
                userId,
                users: getConnectedPeopleAndMessage.rows
            };
            socket.emit("get-connected-people-messages", connectionDetails);
        }
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