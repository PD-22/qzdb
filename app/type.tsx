import { z } from "zod";

export const databaseSchema = {
    quiz: z.object({
        quiz_id: z.number(),
        title: z.string(),
        description: z.string()
    }),
    question: z.object({
        question_id: z.number(),
        quiz_id: z.number(),
        description: z.string()
    }),
    variant: z.object({
        variant_id: z.number(),
        question_id: z.number(),
        variant_text: z.string()
    }),
    answer: z.object({
        question_id: z.number(),
        variant_id: z.number()
    })
}

const questionSchema = z.object({
    id: z.number(),
    description: z.string(),
    variants: z.array(z.object({
        id: z.number(),
        text: z.string(),
        status: z.boolean()
    }))
});
export type Question = z.infer<typeof questionSchema>;

export const quizSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    questions: z.array(questionSchema)
});
export type Quiz = z.infer<typeof quizSchema>;
