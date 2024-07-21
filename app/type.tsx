import { z } from "zod";

export const quizSchema = z.object({
    quiz_id: z.number(),
    title: z.string(),
    description: z.string()
});

export const questionSchema = z.object({
    question_id: z.number(),
    quiz_id: z.number(),
    description: z.string()
});

export const variantSchema = z.object({
    variant_id: z.number(),
    question_id: z.number(),
    variant_text: z.string()
});

export const answerSchema = z.object({
    question_id: z.number(),
    variant_id: z.number()
});

export const fullQuizSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    questions: z.array(z.object({
        id: z.number(),
        description: z.string(),
        variants: z.array(z.object({
            id: z.number(),
            text: z.string(),
            status: z.boolean()
        }))
    }))
});

export type FullQuiz = z.infer<typeof fullQuizSchema>;
