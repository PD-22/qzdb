'use server';

import { groupBy, keyBy } from 'lodash';
import { unstable_noStore as noStore } from 'next/cache';
import { z } from "zod";
import { pool } from "./db";

const answerSchema = z.object({ question_id: z.number(), variant_id: z.number() });
const variantSchema = z.object({ variant_id: z.number(), question_id: z.number(), variant_text: z.string() });
const questionSchema = z.object({ question_id: z.number(), quiz_id: z.number(), question_text: z.string() });
const quizSchema = z.object({ quiz_id: z.number(), title: z.string(), description: z.string() });
const quizDataSchema = z.object({
    title: z.string(),
    description: z.string(),
    tests: z.array(
        z.object({
            question: z.string(),
            variants: z.array(z.string()),
            answer: z.number()
        })
    )
});
type QuizData = z.infer<typeof quizDataSchema>;

export async function getQuizzes(): Promise<QuizData[]> {
    noStore();
    const client = await pool.connect();

    try {
        const quizList = await client
            .query('SELECT * FROM quiz;')
            .then(data => z.array(quizSchema).parse(data.rows));

        const quizQuestions = await client
            .query('SELECT * FROM question;')
            .then(data => groupBy(
                z.array(questionSchema).parse(data.rows),
                x => x.quiz_id
            ));

        const questionVariants = await client
            .query('SELECT * FROM variant;')
            .then(data => groupBy(
                z.array(variantSchema).parse(data.rows),
                x => x.question_id
            ));

        const questionAnswers = await client
            .query('SELECT * FROM answer;')
            .then(data => keyBy(
                z.array(answerSchema).parse(data.rows),
                x => x.question_id
            ));

        return z.array(quizDataSchema).parse(quizList.map(quiz => {
            const { quiz_id, title, description } = quiz;

            const questions = quizQuestions[quiz_id];
            if (questions === undefined) throw new Error();

            const tests = questions.map(({ question_id, question_text }) => {
                const variants = questionVariants[question_id];
                if (variants === undefined) throw new Error();

                const answer = questionAnswers[question_id];
                if (answer === undefined) throw new Error();

                return {
                    question: question_text,
                    variants: variants.map(v => v.variant_text),
                    answer: z.number().min(0).parse(variants.findIndex(
                        v => v.variant_id === answer.variant_id
                    ))
                };
            });

            return { title, description, tests };
        }));
    } finally {
        client.release();
    }
}
