import express, { NextFunction, Request, Response } from "express";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import session from "express-session";
import pgSession from "connect-pg-simple";
import dotenv from "dotenv";

// import { PSocket } from "./interfaces/common.interface";
import * as db from "./db/db-client";
import initializeAllTables from "./db/db-init";
import { errorHandler } from "./utils/errorHandler.util";
import authRouter from "./routes/auth.route";
import utilRouter from "./routes/util.route";
// import { SuccessResponse } from "./interfaces/common.interface";

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

const sessionMiddleware = session({
    name: "SSID",
    secret: "secret",
    saveUninitialized: false,
    resave: false,
    rolling: true,
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
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: "http://localhost:4200",
    optionsSuccessStatus: 200,
    credentials: true
}));
app.use(sessionMiddleware);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/util", utilRouter);
app.get("/", async (req, res, next) => {
    let result = (await db.query(`SELECT * FROM "e-conn-app".users`)).rows;
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
        origin: "http://localhost:4200",
        methods: ['GET', 'POST'],
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
    console.log('a user connected', req.session.id);
    await socket.join(userId);
    socket.on("private-message", ({ message, to }) => {
        socket.to(to).emit("private-message", { message, from: userId, to });
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
            // console.log({ "search-connection": connectionSearchSuccessResponse.users });
            socket.emit("get-connections", connectionSearchSuccessResponse);
        }
    });
});
// io.on("connect_error", (err) => {
//     console.log(`Connection error: ${err.message}`);
// });

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});