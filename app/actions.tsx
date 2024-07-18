'use server';

import { unstable_noStore as noStore } from 'next/cache';
import { z } from "zod";
import { pool } from "./db";

const quizSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    tests: z.array(z.object({
        id: z.number(),
        question: z.string(),
        variants: z.array(z.object({
            id: z.number(),
            text: z.string(),
            status: z.boolean()
        }))
    }))
});
type Quiz = z.infer<typeof quizSchema>;

export async function getQuizzes(): Promise<Quiz[]> {
    noStore();
    const client = await pool.connect();
    try {
        const response = await client.query('SELECT get_quiz_data();');
        const data = response.rows[0]?.get_quiz_data;
        return z.array(quizSchema).parse(data);
    } finally {
        client.release();
    }
}
