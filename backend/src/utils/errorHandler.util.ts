import { NextFunction, Request, Response } from "express";

import { CustomError } from "../interfaces/common.interface";

export const errorHandler = (error: CustomError, req: Request, res: Response, next: NextFunction) => {
    const modifiedMessageError = getProperErrorMessage(error) || "Internal Server Error";
    error.statusCode = error.statusCode || 500;
    (process.env.NODE_ENV === 'development') && console.log(error.stack);
    res.status(error.statusCode).json(modifiedMessageError);
};

export const socketErrorHandler = (error: CustomError) => {
    const modifiedMessageError = getProperErrorMessage(error) || "Internal Server Error";
    error.statusCode = error.statusCode || 500;
    (process.env.NODE_ENV === 'development') && console.log(error.stack);
    return modifiedMessageError;
};

function getProperErrorMessage(error: CustomError): CustomError {
    if (error.constraint === "users_email_key") {
        error.statusCode = 409;
        error.message = "Email id already exist";
    }
    return error;
}