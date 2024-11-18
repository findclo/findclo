import fs from 'fs';
import crypto from 'crypto';
import path from 'path';
import pool from '../conf/db.connections';

const upMigrationsDir = path.join(__dirname, '/up');
const downMigrationsDir = path.join(__dirname, '/down');

function calculateFileHash(filePath: string) {
    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHmac('sha256', 'fixed-seed');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

async function getMigrationHash(migrationName: string): Promise<string | null> {
    const result = await pool.query('SELECT hash FROM migrations WHERE file_name = $1', [migrationName]);
    if (result.rows.length > 0) {
        return result.rows[0].hash;
    }
    return null;
}

async function markMigrationAsRun(migrationName: string, fileHash: string) {
    await pool.query('INSERT INTO migrations (file_name, hash) VALUES ($1, $2)', [migrationName, fileHash]);
}

async function runMigration(filePath: string) {
    const queryText = fs.readFileSync(filePath, { encoding: 'utf-8' });
    const fileName = path.basename(filePath);
    const fileHash = calculateFileHash(filePath);
    const existingHash = await getMigrationHash(fileName);

    if (existingHash) {
        if (existingHash === fileHash) {
            console.log(`Migration ${fileName} has already been run and hasn't changed. Skipping.`);
            return;
        } else {
            throw new Error(`Hash mismatch for migration ${fileName}. Migration has been altered since it was last run. Halting migrations.`);
        }
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        try {
            await client.query(queryText);
            await markMigrationAsRun(fileName, fileHash);
            await client.query('COMMIT');
            console.log(`Successfully ran migration: ${fileName}`);
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(`Error running migration: ${fileName}`, err);
            throw err;
        }
    } finally {
        client.release();
    }
}

async function runMigrations() {
    try {
        const files = fs.readdirSync(upMigrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort((a, b) => parseInt(a.split('-')[0], 10) - parseInt(b.split('-')[0], 10));


        for (let file of files) {
            await runMigration(path.join(upMigrationsDir, file));
        }

        console.log('All migrations finished. Database connection remains open.');
    } catch (error) {
        console.error('Migration process halted due to an error:', error);
        throw error;
    }
}

async function runLastDownMigration() {
    const result = await pool.query('SELECT file_name FROM migrations ORDER BY applied_at DESC LIMIT 1');
    const lastMigration = result.rows[0];

    if (!lastMigration) {
        console.log("No migrations have been run.");
        return;
    }

    const fileName = lastMigration.file_name;
    const downMigrationFilePath = path.join(downMigrationsDir, fileName);

    if (!fs.existsSync(downMigrationFilePath)) {
        throw new Error(`Down migration script not found for the last applied migration: ${fileName}`);
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        try {
            const queryText = fs.readFileSync(downMigrationFilePath, { encoding: 'utf-8' });
            await client.query(queryText);
            await client.query('DELETE FROM migrations WHERE file_name = $1', [fileName]);
            await client.query('COMMIT');
            console.log(`Successfully ran DOWN migration: ${fileName}`);
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(`Error running DOWN migration: ${fileName}`, err);
            throw err;
        }
    } finally {
        client.release();
    }
}

const runMode = process.argv[2];

async function main() {
    try {
        if (runMode === 'down') {
            console.log("Running DOWN migrations...");
            await runLastDownMigration();
        } else {
            console.log("Running UP migrations...");
            await runMigrations();
        }
        console.log('Migration process completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration process halted due to an error:', error);
        process.exit(1);
    }
}

main();
