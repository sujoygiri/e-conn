import { NextFunction, Request, Response } from "express";

import { CustomError } from "../interfaces/common.interface";

export const errorHandler = (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    const errorMessage = getProperErrorMessage(error) || "Internal Server Error";
    const statusCode = error.statusCode || 500;

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message: errorMessage,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};

function getProperErrorMessage(error: CustomError): string {
    let errorMessage: string = error.message;
    if (error.constraint === "users_email_key") {
        error.statusCode = 409;
        errorMessage = "Email id already exist";
    }
    return errorMessage;
}