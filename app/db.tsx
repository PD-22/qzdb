import { Pool } from 'pg';

export const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT ?? ''),

    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});
