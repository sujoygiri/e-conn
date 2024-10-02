import { pool } from "../db/db-client";

//create users table if not exists
const createUsersTable = async () => {
    const queryString = `CREATE TABLE IF NOT EXISTS "e-conn-app".users (
        u_id uuid DEFAULT gen_random_uuid(),
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        PRIMARY KEY (u_id)
    );`;
    await pool.query(queryString);
};

async function initializeAllTables() {
    try {
        await createUsersTable();
    } catch (error) {

    }
}

export default initializeAllTables;