'use server';

import _, { groupBy, keyBy, mapValues } from 'lodash';
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
                    status: v.variant_id === answer.variant_id
                }));

                return { id: question_id, description: description, variants };
            });

            return { id: quiz_id, title, description, questions };
        }));
    } finally {
        client.release();
    }
}

export type CreateQuizFormState = {
    message: string;
    fields?: type.NewQuizFields;
    issues?: type.NewQuizIssues;
};
export async function createQuiz(
    prevState: CreateQuizFormState,
    data: FormData
): Promise<CreateQuizFormState> {
    const formData = Object.fromEntries(data);
    const parsed = type.newQuizSchema.safeParse(formData);
    const fields = type.newQuizFieldsSchema.parse(
        mapValues(formData, v => v.toString())
    );

    const message = "Invalid form data";
    if (!parsed.success) {
        const _issues = {};
        parsed.error.issues.forEach(a => _.set(_issues, a.path, a.message));
        const issues = type.newQuizIssuesSchema.parse(_issues);
        return { message, fields, issues };
    }

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
