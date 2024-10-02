import { Pool } from "pg";

export const pool = new Pool({
    user: "dev-db",
    password: "dev-db",
    host: "localhost",
    port: 5432,
    database: "dev-db",
});
export const query = (queryString: string, params?: any[]) => {
    return pool.query(queryString, params);
};