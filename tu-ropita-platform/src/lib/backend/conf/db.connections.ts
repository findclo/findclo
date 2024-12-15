import { Pool } from 'pg';
// @ts-ignore
import globalSettings from "../../settings.ts";

const pool = new Pool({
    user: globalSettings.PSQL_CONFIG.DATABASE_USER,
    host: globalSettings.PSQL_CONFIG.DATABASE_HOST,
    database: globalSettings.PSQL_CONFIG.DATABASE_NAME,
    password: globalSettings.PSQL_CONFIG.DATABASE_PASSWORD,
    port:globalSettings.PSQL_CONFIG.DATABASE_PORT,
    // ssl: {
    //     rejectUnauthorized: false
    // }
});

export async function query(text: string, params: any) {
    const res = await pool.query(text, params);
    return res.rows;
}

export default pool;