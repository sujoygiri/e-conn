import { Socket } from "socket.io";

export interface PSocket extends Socket {
    username?: string;
}

export interface CustomError extends Error {
    statusCode?: number;
    constraint?: string;
    // errorMessage?:string;
}

export interface SuccessResponse {
    status: "success" | "fail";
    statusCode: number;
    message: string;
    username?: string;
}