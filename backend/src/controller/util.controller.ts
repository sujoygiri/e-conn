import { Server, Socket } from "socket.io";

import * as db from "../db/db-client";
import { CustomError, SuccessResponse } from "../interfaces/common.interface";
import { emailValidation } from "../utils/rawInputValidation";

const searchUser = async (email: string) => {
    const searchQuery = `SELECT user_id, username, email FROM "e-conn-app".users WHERE email=$1`;
    const queryResult = await db.query(searchQuery, [email]);
    if (queryResult.rowCount) {
        let response: SuccessResponse = {
            status: "success",
            statusCode: 200,
            message: "User found",
            data: {
                user: queryResult.rows
            }
        };
        return response;
    } else {
        let error: CustomError = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }
};

export const searchHandler = async (io: Server, socket: Socket) => {
    // const result = validationResult(socket.request);
    socket.on("search-new-user", async ({ email }) => {
        try {
            const { error, value } = emailValidation.validate(email);
            if (!error) {
                let response = await searchUser(value);
                socket.emit("search-new-user", response);
            } else {
                let customError: CustomError = new Error(error.message.replace('"value"', error.details[0].context?.value));
                customError.statusCode = 400;
                socket.emit("sent-error", customError);
            }
        } catch (error: any) {
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