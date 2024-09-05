import { Pool } from 'pg';
import globalSettings from "@/lib/settings";

const pool = new Pool({
    user: globalSettings.PSQL_CONFIG.DATABASE_USER,
    host: globalSettings.PSQL_CONFIG.DATABASE_HOST,
    database: globalSettings.PSQL_CONFIG.DATABASE_NAME,
    password: globalSettings.PSQL_CONFIG.DATABASE_PASSWORD,
    port:globalSettings.PSQL_CONFIG.DATABASE_PORT,
});

export async function query(text: string, params: any) {
    const res = await pool.query(text, params);
    return res.rows;
}

export default pool;