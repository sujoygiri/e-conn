import { pool } from "../db/db-client";

//create users table if not exists
const createUsersTable = async () => {
    const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".users (
        user_id uuid DEFAULT gen_random_uuid(),
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id)
    );`;
    await pool.query(queryString);
};

// create user_connection table if not exists
const createConnectionsTable = async () => {
    const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".user_connections (
        user_id uuid NOT NULL,
        connected_user_id uuid NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, connected_user_id),
        FOREIGN KEY (user_id) REFERENCES "e-conn-app".users(user_id),
        FOREIGN KEY (connected_user_id) REFERENCES "e-conn-app".users(user_id),
        UNIQUE (user_id, connected_user_id),
        UNIQUE (connected_user_id, user_id)
    );`;
    await pool.query(queryString);
};

// create chat table if not exists
const createChatsTable = async () => {
    const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".chats (
        chat_id uuid DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        sender_id uuid NOT NULL,
        receiver_id uuid NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (chat_id),
        FOREIGN KEY (sender_id) REFERENCES "e-conn-app".users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES "e-conn-app".users(user_id) ON DELETE CASCADE
    );`;
    await pool.query(queryString);
};

// create chat status table if not exists
// const createChatStatusTable = async () => {
//     const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".chat_status (
//         user_id uuid NOT NULL,
//         chat_id uuid NOT NULL,
//         is_read BOOLEAN NOT NULL DEFAULT FALSE,
//         created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
//         PRIMARY KEY (user_id, chat_id),
//         FOREIGN KEY (user_id) REFERENCES "e-conn-app".users(user_id) ON DELETE CASCADE,
//         FOREIGN KEY (chat_id) REFERENCES "e-conn-app".chats(chat_id) ON DELETE CASCADE
//     );`;
//     await pool.query(queryString);
// };

// create group table if not exists
const createGroupsTable = async () => {
    const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".groups (
        group_id uuid DEFAULT gen_random_uuid(),
        group_name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        created_by uuid NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (group_id),
        FOREIGN KEY (created_by) REFERENCES "e-conn-app".users(user_id)
    );`;
    await pool.query(queryString);
};

// create group_members table if not exists
const createGroupMembersTable = async () => {
    const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".group_members (
        group_id uuid NOT NULL,
        user_id uuid NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (group_id, user_id),
        FOREIGN KEY (group_id) REFERENCES "e-conn-app".groups(group_id),
        FOREIGN KEY (user_id) REFERENCES "e-conn-app".users(user_id),
        UNIQUE (group_id, user_id)
    );`;
    await pool.query(queryString);
};

// create group_messages table if not exists
const createGroupMessagesTable = async () => {
    const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".group_messages (
        message_id uuid DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        sender_id uuid NOT NULL,
        group_id uuid NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (message_id),
        FOREIGN KEY (sender_id) REFERENCES "e-conn-app".users(user_id),
        FOREIGN KEY (group_id) REFERENCES "e-conn-app".groups(group_id)
    );`;
    await pool.query(queryString);
};

async function initializeAllTables() {
    try {
        await createUsersTable();
        await createChatsTable();
        // await createChatStatusTable();
        await createConnectionsTable();
        await createGroupsTable();
        await createGroupMembersTable();
        await createGroupMessagesTable();
    } catch (error) {
        throw error;
    }
}

export default initializeAllTables;
