'use server';

import { z } from "zod";
import { pool } from "./db";
import { unstable_noStore as noStore } from 'next/cache';

export async function getRandomNumber(): Promise<number> {
    noStore();
    const client = await pool.connect();

    try {
        const result = await client.query('SELECT random()');

        const { random } = z
            .object({ random: z.number() })
            .parse(result.rows[0]);
        return random;
    } finally {
        client.release();
    }
}
