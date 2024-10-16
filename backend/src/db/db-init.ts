import { pool } from "../db/db-client";

//create users table if not exists
const createUsersTable = async () => {
    const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".users (
        user_id uuid DEFAULT gen_random_uuid(),
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        PRIMARY KEY (user_id)
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
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        PRIMARY KEY (chat_id),
        FOREIGN KEY (sender_id) REFERENCES "e-conn-app".users(user_id),
        FOREIGN KEY (receiver_id) REFERENCES "e-conn-app".users(user_id),
        UNIQUE (sender_id, receiver_id),
        UNIQUE (receiver_id, sender_id)
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

async function initializeAllTables() {
    try {
        await createUsersTable();
        await createChatsTable();
        await createConnectionsTable();
    } catch (error) {
        throw error;
    }
}

export default initializeAllTables;