export interface SuccessResponse {
    status: "success" | "fail";
    statusCode: number;
    message: string;
    userId?: string;
    username?: string;
    email?: string;
}

export interface ErrorResponse {
    status: "error";
    statusCode: number;
    message: string;
}

export interface AuthData {
    username?: string;
    email: string;
    password: string;
}

export interface People {
    userId: string;
    username: string;
    email: string;
}