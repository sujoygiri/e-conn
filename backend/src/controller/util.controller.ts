import { NextFunction, Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";

import * as db from "../db/db-client";
import { CustomError, SuccessResponse } from "../interfaces/common.interface";

export const searchHandler = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
        try {
            const { email } = matchedData(req);
            const searchQuery = `SELECT user_id, username, email FROM "e-conn-app".users WHERE email=$1`;
            const queryResult = await db.query(searchQuery, [email]);
            if (queryResult.rowCount === 0) {
                let error: CustomError = new Error("User not found");
                error.statusCode = 404;
                next(error);
            } else {
                let userData = queryResult.rows[0];
                let response: SuccessResponse = {
                    status: "success",
                    statusCode: 200,
                    message: "User found",
                    userId: userData.user_id,
                    username: userData.username,
                    email: userData.email
                };
                res.status(200).json(response);
            }
        } catch (error) {
            next(error);
        }
    } else {
        let errorMessage = result.array()[0].msg;
        let error: CustomError = new Error(errorMessage);
        error.statusCode = 400;
        next(error);
    }
};