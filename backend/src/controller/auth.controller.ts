import { NextFunction, Request, Response } from "express";
import { validationResult, matchedData } from "express-validator";
import * as bcrypt from "bcryptjs";

import * as db from "../db/db-client";
import { CustomError, SuccessResponse } from "../interfaces/common.interface";

export const signupHandler = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
        try {
            const { username, email, password } = matchedData(req);
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);
            let userCreationQuery = `INSERT INTO "e-conn-app".users (username,email,password) VALUES ($1,$2,$3) RETURNING user_id`;
            let queryResult = await db.query(userCreationQuery, [username, email, hashedPassword]);
            if (queryResult.command === "INSERT" && queryResult.rowCount === 1) {
                let userId = queryResult.rows[0]['user_id'];
                req.session.userData = {
                    userId
                };
                let responseObj: SuccessResponse = {
                    status: "success",
                    statusCode: 201,
                    message: "Account created successfully",
                    username,
                    email,
                    userId,
                };
                res.status(responseObj.statusCode).json(responseObj);
            }
        } catch (error: any) {
            next(error);
        }
    }
    else {
        let errorMessage = result.array()[0].msg;
        let error = new Error(errorMessage);
        next(error);
    }
};

export const signinHandler = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
        try {
            const { email, password } = matchedData(req);
            let getUserDataQuery = `SELECT user_id,username,email,password FROM "e-conn-app".users WHERE email=$1`;
            let queryResult = await db.query(getUserDataQuery, [email]);
            if (queryResult.rows.length) {
                let { user_id, username, email, password: hashedPassword } = queryResult.rows[0];
                let isCorrectPassword = bcrypt.compareSync(password, hashedPassword);
                if (isCorrectPassword) {
                    req.session.userData = {
                        userId: user_id
                    };
                    let responseObj: SuccessResponse = {
                        status: "success",
                        statusCode: 200,
                        message: "Signin successful",
                        username,
                        email,
                        userId: user_id,
                    };
                    res.status(responseObj.statusCode).json(responseObj);
                } else {
                    let wrongPasswordError: CustomError = new Error("Wrong password");
                    wrongPasswordError.statusCode = 401;
                    next(wrongPasswordError);
                }
            } else {
                let emailNotFoundError: CustomError = new Error("Email id not exist");
                emailNotFoundError.statusCode = 404;
                next(emailNotFoundError);
            }
        } catch (error) {
            next(error);
        }
    } else {
        let errorMessage = result.array()[0].msg;
        let error = new Error(errorMessage);
        next(error);
    }
};

export const authenticationHandler = async (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
        try {
            let sessionId: string = req.session.id;
            let findSessionDataQuery = `SELECT sess FROM "e-conn-app".sessions WHERE sid=$1`;
            let sessionQueryResult = await db.query(findSessionDataQuery, [sessionId]);
            let userData: any = sessionQueryResult?.rows[0]?.sess.userData;
            if (userData) {
                let { userId } = userData;
                let userDataQueryString = `SELECT username,email FROM "e-conn-app".users WHERE user_id=$1`;
                let userDataQueryResult = await db.query(userDataQueryString, [userId]);
                let { username, email } = userDataQueryResult.rows[0];
                let verifyResponse: SuccessResponse = {
                    status: "success",
                    statusCode: 200,
                    message: "Authentication successful",
                    username,
                    email,
                    userId,
                };
                res.status(verifyResponse.statusCode).json(verifyResponse);
            } else {
                let error: CustomError = new Error("Session not found");
                error.statusCode = 404;
                next(error);
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