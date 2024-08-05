'use server';

import _, { find, groupBy, keyBy, map, mapValues, pickBy, sortBy } from 'lodash';
import { unstable_noStore as noStore, revalidatePath } from 'next/cache';
import { z } from "zod";
import { pool } from "./db";
import * as type from './type';

export async function getQuizzes(): Promise<type.Quiz[]> {
    noStore();
    const client = await pool.connect();

    try {
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
        client.release();
    }
}

export type CreateQuizFormState = {
    message: string;
    fields?: Record<string | number, unknown>;
    issues?: Record<string | number, unknown>;
};
export async function createQuiz(
    prevState: CreateQuizFormState,
    data: FormData
): Promise<CreateQuizFormState> {
    const entries = Object.fromEntries(data);
    const fields = {
        title: entries['title'],
        description: entries['description'],
        questions: map(sortBy(pickBy(mapValues(entries, (v, k) => {
            const match = k.match(/^questions\.(\d+)\.description$/);
            if (!match) return;
            const index = z.coerce.number().int().parse(match?.[1]);

            const variants = map(sortBy(pickBy(mapValues(entries, (v, k) => {
                const match = k.match(new RegExp(`^questions\\.${index}\\.variants\\.(\\d+)\.text$`));
                if (!match) return;
                const i = z.coerce.number().int().parse(match?.[1]);
                return [i, v] as const;
            }), v => v !== undefined), v => v[0]), ([, text]) => ({ text }));

            const answerRegex = `^questions\\.${index}\\.answer$`;
            const answer = find(entries, (_, k) => new RegExp(answerRegex).test(k));

            const value = { description: v, variants, answer: Number(answer) };
            return [index, value] as const;
        }), v => v !== undefined), v => v[0]), ([_, v]) => v)
    };

    const parsed = type.newQuizSchema.safeParse(fields);

    const message = "Invalid form data";
    if (!parsed.success) {
        const issues = {};
        parsed.error.issues.forEach(a => _.set(issues, a.path, a.message));
        return { message, fields, issues };
    }

    console.log('Parsed data: ', JSON.stringify(parsed.data, null, 2));
    return { message: 'Success' };
}

export async function deleteQuiz(id: number) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM quiz WHERE quiz_id = $1', [id]);
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        revalidatePath('/');
        client.release();
    }
}
