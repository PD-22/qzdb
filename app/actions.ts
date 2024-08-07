'use server';

import { groupBy, keyBy } from 'lodash';
import { unstable_noStore as noStore, revalidatePath } from 'next/cache';
import { PoolClient } from 'pg';
import { z } from "zod";
import { pool } from "./db";
import * as type from './type';

export async function getQuizzes(): Promise<type.Quiz[]> {
    let client;
    try {
        noStore();
        client = await pool.connect();

        const quizList = await client
            .query('SELECT * FROM quiz;')
            .then(data => z.array(type.databaseSchema.quiz).parse(data.rows));

        const quizQuestions = await client
            .query('SELECT * FROM question;')
            .then(data => groupBy(
                z.array(type.databaseSchema.question).parse(data.rows),
                x => x.quiz_id
            ));

        const questionVariants = await client
            .query('SELECT * FROM variant;')
            .then(data => groupBy(
                z.array(type.databaseSchema.variant).parse(data.rows),
                x => x.question_id
            ));

        const questionAnswers = await client
            .query('SELECT * FROM answer;')
            .then(data => keyBy(
                z.array(type.databaseSchema.answer).parse(data.rows),
                x => x.question_id
            ));

        return z.array(type.quizSchema).parse(quizList.map(quiz => {
            const { quiz_id, title, description } = quiz;

            const _questions = quizQuestions[quiz_id];
            if (_questions === undefined) throw new TypeError('questions is undefined');

            const questions = _questions.map(({ question_id, description }) => {
                const variantList = questionVariants[question_id];
                if (variantList === undefined) throw new TypeError('variantList is undefined');

                const answer = questionAnswers[question_id];
                if (answer === undefined) throw new TypeError('answer is undefined');

                const variants = variantList.map(v => ({
                    id: v.variant_id,
                    text: v.variant_text,
                }));

                const answerIndex = variants.findIndex(v => v.id === answer.variant_id);
                if (answerIndex < 0) throw new TypeError('answerIndex is negative');

                return { id: question_id, description, variants, answer: answerIndex };
            });

            return { id: quiz_id, title, description, questions };
        }));
    } finally {
        client?.release();
    }
}

export async function createQuiz(
    _prevState: { success?: boolean },
    data: unknown
): Promise<{ success?: boolean }> {
    let client: PoolClient | undefined;
    try {
        client = await pool.connect();
        await client.query('BEGIN');

        const parsed: type.NewQuiz = type.newQuizSchema.parse(data);
        console.log('Parsed data: ', JSON.stringify(parsed, null, 2));

        const quizId = z.number().parse(await client.query(
            `INSERT INTO quiz (title, description) VALUES ($1, $2) RETURNING quiz_id`,
            [parsed.title, parsed.description]
        ).then(x => x.rows[0].quiz_id));

        for (const question of parsed.questions) {
            const questionId = z.number().parse(await client.query(
                `INSERT INTO question (quiz_id, description) VALUES ($1, $2) RETURNING question_id`,
                [quizId, question.description]
            ).then(x => x.rows[0].question_id));

            let correctVariantId: number | undefined;
            for (const [i, variant] of Array.from(question.variants.entries())) {
                const variantId = z.number().parse(await client.query(
                    `INSERT INTO variant (question_id, variant_text) VALUES ($1, $2) RETURNING variant_id`,
                    [questionId, variant.text]
                ).then(x => x.rows[0].variant_id));

                if (i === question.answer) correctVariantId = variantId;
            }

            if (!correctVariantId) throw new Error('Invalid answer');
            await client.query(
                `INSERT INTO answer (question_id, variant_id) VALUES ($1, $2)`,
                [questionId, correctVariantId]
            );
        }

        await client.query('COMMIT');
        console.log('Quiz created successfully');

        return { success: true };
    } catch (error) {
        await client?.query('ROLLBACK');
        console.error(
            'create quiz action failed',
            error instanceof Error ? error.message : error
        );
        return { success: false };
    } finally {
        client?.release();
        revalidatePath('/')
    }
}

export async function deleteQuiz(id: number) {
    let client;
    try {
        client = await pool.connect();
        await client.query('BEGIN');
        await client.query('DELETE FROM quiz WHERE quiz_id = $1', [id]);
        await client.query('COMMIT');
    } catch (error) {
        await client?.query('ROLLBACK');
        throw error;
    } finally {
        revalidatePath('/');
        client?.release();
    }
}
