export interface SuccessResponse {
    status: "success" | "fail";
    statusCode: number;
    message: string;
    username?: string;
}

export interface ErrorResponse {
    status: "error";
    statusCode: number;
    message: string;
}

export interface UserData {
    username?: string;
    email: string;
    password: string;
}