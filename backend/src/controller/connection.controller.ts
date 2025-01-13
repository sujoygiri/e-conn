import { Server, Socket } from 'socket.io';

import * as db from '../db/db-client';
import { CustomError, SuccessResponse } from '../interfaces/common.interface';

export const newConnectionHandler = async (io: Server, socket: Socket) => {
    socket.on('new-connection', async (data: { user_id: string, connected_user_id: string, created_at: string; }, callback) => {
        try {
            if (!data.user_id || !data.connected_user_id || !data.created_at) {
                let customError: CustomError = new Error("Bad Request");
                customError.statusCode = 400;
                throw customError;
            }
            let newConnectionQuery = `INSERT INTO "e-conn-app".private_chats_connections (user_id, connected_user_id, last_sent_chat_id, new_chats_count, created_at) VALUES ($1, $2, NULL, 0, $3)`;
            let queryResult = await db.query(newConnectionQuery, [data.user_id, data.connected_user_id, data.created_at]);
            if (queryResult.command === 'INSERT' && queryResult.rowCount === 1) {
                let successResponse: SuccessResponse = {
                    status: 'success',
                    statusCode: 201,
                    message: 'Connection added successfully',
                    data: { user_id: data.user_id, connected_user_id: data.connected_user_id }
                };
                callback({ successResponse });
            }
        } catch (error: any) {
            if ('statusCode' in error && 'message' in error) {
                socket.emit("sent-error", { statusCode: error.statusCode, message: error.message });
            } else {
                let customError: CustomError = new Error("Internal Server Error");
                customError.statusCode = 500;
                socket.emit("sent-error", { message: customError.message, statusCode: customError.statusCode });
            }
        }
    });
};

export const getConnectionHandler = async (io: Server, socket: Socket) => {
    socket.on("get-connections", async ({ user_id }) => {
        try {
            if (!user_id) {
                let customError: CustomError = new Error("Bad Request");
                customError.statusCode = 400;
                throw customError;
            }
            let getPrivateChatConnectionQuery = `
            SELECT 
                private_connection.connected_user_id, 
                users.username, 
                users.email, 
                private_chat.content, 
                COALESCE(private_connection.new_chats_count, 0) AS new_chats_count, 
                private_chat.sender_id, 
                private_chat.message_type, 
                private_chat.is_read, 
                private_chat.created_at As last_chat_time
            FROM 
                "e-conn-app".private_chats_connections AS private_connection
            LEFT JOIN 
                "e-conn-app".users AS users 
                ON private_connection.connected_user_id = users.user_id
            LEFT JOIN 
                "e-conn-app".private_chats AS private_chat 
                ON private_connection.last_sent_chat_id = private_chat.chat_id
            WHERE 
                private_connection.user_id = $1
            ORDER BY 
                private_chat.created_at DESC;
            `;
            let getGroupChatConnectionQuery = `
            SELECT 
                groups.group_name, 
                group_chats.content, 
                group_chats.message_type, 
                group_chats.sender_id, 
                COALESCE(group_members.new_chats_count, 0) AS new_chats_count,
                group_chats.created_at, 
                users.username AS sender_name
            FROM 
                "e-conn-app".groups AS groups
            LEFT JOIN 
                "e-conn-app".group_members AS group_members 
                ON groups.group_id = group_members.group_id
            LEFT JOIN 
                "e-conn-app".group_chats AS group_chats 
                ON groups.last_sent_chat_id = group_chats.chat_id
            LEFT JOIN 
                "e-conn-app".users AS users 
                ON users.user_id = group_chats.sender_id
            WHERE
                group_members.user_id = $1
            ORDER BY 
                group_chats.created_at DESC;
            `;
            const privateChatConnections = await db.query(getPrivateChatConnectionQuery, [user_id]);
            const groupChatConnections = await db.query(getGroupChatConnectionQuery, [user_id]);
            if (privateChatConnections.rows.length > 0 || groupChatConnections.rows.length > 0) {
                let response: SuccessResponse = {
                    status: 'success',
                    statusCode: 200,
                    message: 'Connections fetched successfully',
                    data: { user_id, privateChatConnections: privateChatConnections.rows, groupChatConnections: groupChatConnections.rows }
                };
                socket.emit("get-connections", response);
            } else {
                let customError: CustomError = new Error("Not Found");
                customError.statusCode = 404;
                throw customError;
            }

        } catch (error: any) {
            console.log(error);

            if ('statusCode' in error && 'message' in error) {
                socket.emit("sent-error", { statusCode: error.statusCode, message: error.message });
            } else {
                let customError: CustomError = new Error("Internal Server Error");
                customError.statusCode = 500;
                socket.emit("sent-error", customError);
            }
        }

    });
};