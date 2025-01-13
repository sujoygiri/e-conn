import { pool } from "../db/db-client";

// create common ENUM if not exists
const createCommonEnum = async () => {
    const isTypeAlreadyCreated = `SELECT * FROM pg_type WHERE typname = 'common_message_type';`;
    const res = await pool.query(isTypeAlreadyCreated);
    if (res.rowCount === 0) {
        const queryString = `CREATE TYPE "e-conn-app".common_message_type AS ENUM (
            'text',
            'image',
            'video',
            'audio',
            'file'
        );`;
        await pool.query(queryString);
    }
};
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
const createPrivateConnectionsTable = async () => {
    const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".private_chats_connections (
        user_id uuid NOT NULL,
        connected_user_id uuid NOT NULL,
        last_sent_chat_id uuid DEFAULT NULL,
        new_chats_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, connected_user_id),
        FOREIGN KEY (user_id) REFERENCES "e-conn-app".users(user_id),
        FOREIGN KEY (connected_user_id) REFERENCES "e-conn-app".users(user_id),
        FOREIGN KEY (last_sent_chat_id) REFERENCES "e-conn-app".private_chats(chat_id),
        UNIQUE (user_id, connected_user_id),
        UNIQUE (connected_user_id, user_id)
    );`;
    await pool.query(queryString);
};

// create chat table if not exists
const createPrivateChatsTable = async () => {
    const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".private_chats (
        chat_id uuid DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        sender_id uuid NOT NULL,
        receiver_id uuid NOT NULL,
        is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
        message_type "e-conn-app".common_message_type NOT NULL DEFAULT 'text',
        attachment_url TEXT DEFAULT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (chat_id),
        FOREIGN KEY (sender_id) REFERENCES "e-conn-app".users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES "e-conn-app".users(user_id) ON DELETE CASCADE
    );`;
    await pool.query(queryString);
};

// create private chat reaction table if not exists
const createPrivateChatReactionTable = async () => {
    const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".private_chat_status (
        user_id uuid NOT NULL,
        chat_id uuid NOT NULL,
        reaction_type VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, chat_id),
        FOREIGN KEY (user_id) REFERENCES "e-conn-app".users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (chat_id) REFERENCES "e-conn-app".private_chats(chat_id) ON DELETE CASCADE
    );`;
    await pool.query(queryString);
};

// create group table if not exists
const createGroupsTable = async () => {
    const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".groups (
        group_id uuid DEFAULT gen_random_uuid(),
        group_name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        created_by uuid NOT NULL,
        last_sent_chat_id uuid DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (group_id),
        FOREIGN KEY (created_by) REFERENCES "e-conn-app".users(user_id),
        FOREIGN KEY (last_sent_chat_id) REFERENCES "e-conn-app".group_chats(chat_id) 
    );`;
    await pool.query(queryString);
};

// create group_members table if not exists
const createGroupMembersTable = async () => {
    const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".group_members (
        group_id uuid NOT NULL,
        user_id uuid NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE,
        new_chats_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (group_id, user_id),
        FOREIGN KEY (group_id) REFERENCES "e-conn-app".groups(group_id),
        FOREIGN KEY (user_id) REFERENCES "e-conn-app".users(user_id),
        UNIQUE (group_id, user_id)
    );`;
    await pool.query(queryString);
};

// const addForeignKeyToGroupChats = async () => {
//     const queryString = `
//         ALTER TABLE IF NOT EXISTS "e-conn-app".group_chats
//         ADD CONSTRAINT fk_group_id FOREIGN KEY (group_id) REFERENCES "e-conn-app".groups(group_id);
//     `;
//     await pool.query(queryString);
// };

// create group_chats table if not exists
const createGroupChatsTable = async () => {
    const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".group_chats (
        chat_id uuid DEFAULT gen_random_uuid(),
        content TEXT NOT NULL,
        sender_id uuid NOT NULL,
        group_id uuid NOT NULL,
        is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
        message_type "e-conn-app".common_message_type NOT NULL DEFAULT 'text',
        attachment_url TEXT DEFAULT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (chat_id),
        FOREIGN KEY (sender_id) REFERENCES "e-conn-app".users(user_id),
        FOREIGN KEY (group_id) REFERENCES "e-conn-app".groups(group_id),
        UNIQUE (chat_id, group_id),
        UNIQUE (chat_id, sender_id),
        UNIQUE (sender_id, group_id)
    );`;
    await pool.query(queryString);
};

// create group_chats reactions table if not exists
const createGroupChatsReactionsTable = async () => {
    const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".group_chats_reactions (
        chat_id uuid NOT NULL,
        user_id uuid NOT NULL,
        reaction_type VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (chat_id, user_id),
        FOREIGN KEY (chat_id) REFERENCES "e-conn-app".group_chats(chat_id),
        FOREIGN KEY (user_id) REFERENCES "e-conn-app".users(user_id)
    );`;
    await pool.query(queryString);
};

async function initializeAllTables() {
    try {
        await createCommonEnum();
        await createUsersTable();
        await createPrivateChatsTable();
        await createPrivateChatReactionTable();
        await createPrivateConnectionsTable();
        await createGroupChatsTable();
        await createGroupsTable();
        // await addForeignKeyToGroupChats();
        await createGroupMembersTable();
        await createGroupChatsReactionsTable();
    } catch (error) {
        throw error;
    }
}

export default initializeAllTables;
