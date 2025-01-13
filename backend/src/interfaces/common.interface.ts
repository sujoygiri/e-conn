import { Socket } from "socket.io";

export interface PSocket extends Socket {
    username?: string;
    email?: string;
}

export interface CustomError extends Error {
    statusCode?: number;
    constraint?: string;
    // errorMessage?:string;
}

export interface People {
    user_id: string;
    username: string;
    email: string;
}

export interface SuccessResponse {
    status: "success" | "fail";
    statusCode: number;
    message: string;
    data?: {
        [key: string]: any;
    };
}