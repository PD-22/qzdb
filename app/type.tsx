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
        text: z.string()
    })),
    answer: z.number()
});
export type Question = z.infer<typeof questionSchema>;

export const quizSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    questions: z.array(questionSchema)
});
export type Quiz = z.infer<typeof quizSchema>;

export const newQuizSchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    questions: z.array(
        z.object({
            description: z.string().trim().min(1),
            variants: z.array(z.object({
                text: z.string().trim().min(1)
            })).nonempty(),
            answer: z.number().int().nonnegative()
        }).refine(q => q.answer < q.variants.length)
    ).nonempty()
});
export type NewQuiz = z.infer<typeof newQuizSchema>;

export const newQuizFieldsSchema = z.object({
    title: z.string(),
    description: z.string(),
    questions: z.array(
        z.object({
            description: z.string(),
            variants: z.array(z.object({
                text: z.string(),
            })),
            answer: z.number()
        })
    )
});
export type NewQuizFields = z.infer<typeof newQuizFieldsSchema>;

export const newQuizIssuesSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    questions: z.array(z.object({
        description: z.string().optional(),
        variants: z.array(z.object({
            text: z.string().optional()
        }).optional()).optional(),
        answer: z.string().optional()
    }).or(z.string().optional()).optional()).optional()
});
export type NewQuizIssues = z.infer<typeof newQuizIssuesSchema>;
