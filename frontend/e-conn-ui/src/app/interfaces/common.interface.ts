export interface AuthData {
    username?: string;
    email: string;
    password: string;
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

export interface ErrorResponse {
    status: "error";
    statusCode: number;
    message: string;
}
export interface SideNavigationPanelItem {
    label: string;
    icon: string;
    filledIcon?: string;
    iconClass: string;
    styleClass?: string;
}

export interface DropDownItem {
    title: string;
    icon: string;
    iconClass: string;
    styleClass?: string;
    command?: () => void;
}

export interface ChatDetail {
    chat_id: string;
    content: string;
    sender_id: string;
    receiver_id: string;
    is_read: boolean;
    created_at: string;
    // updated_at: string;
}

export interface Message {
    chat_id?: string;
    content?: string;
    new_messages_count?: number;
    sender_id?: string;
    receiver_id?: string;
    group_id?: string;
    is_deleted?: boolean;
    message_type: string;
    attachment_url?: string;
    is_read?: boolean;
    created_at?: string;
}

export interface CustomError extends Error {
    statusCode?: number;
    errorMessage?: string;
}