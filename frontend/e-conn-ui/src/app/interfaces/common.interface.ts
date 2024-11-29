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

export interface SideNavigationPanelItem {
    label: string;
    icon: string;
    iconClass: string;
    styleClass: string;
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

export interface PeopleAndMessage {
    connected_user_id: string;
    email: string;
    last_message: string;
    last_message_time: string;
    total_unread_chats: string;
    username: string;
}