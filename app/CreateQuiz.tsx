"use client"

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { mapValues, pickBy } from "lodash";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import quizzes from '../scripts/quizzes.json';
import { createQuiz } from "./actions";
import CreateQuestions from "./CreateQuestions";
import { NewQuiz, NewQuizFields, newQuizSchema } from "./type";

export default function CreateQuiz() {
    const [pending, setPending] = useState(false);
    const [state, dispatch] = useFormState(createQuiz, { message: '', fields: quizzes[0] });

    const stateErrors = useMemo(() => mapValues(
        pickBy(state.issues ?? {}, v => v !== undefined),
        m => ({ type: '', message: m })
    ), [state.issues]);

    const defaultValues: NewQuizFields = {
        title: '', description: '', questions: [{ description: '', variants: [] }],
        ...(state.fields) ?? {}
    };

    const form = useForm<NewQuiz>({
        resolver: zodResolver(newQuizSchema),
        defaultValues,
        errors: stateErrors
    });

    const formRef = useRef<HTMLFormElement>(null);
    useEffect(() => { setPending(false); }, [state])

    const success = !state.issues && state.message.length > 0;
    useEffect(() => { if (success) form.reset(); }, [success]);

    return (
        <Form {...form}>
            <form
                ref={formRef}
                className="space-y-4 max-w-96"
                action={dispatch}
                onSubmit={async evt => {
                    evt.preventDefault();
                    await form.handleSubmit(() => {
                        const form = formRef.current ?? undefined;
                        dispatch(new FormData(form));
                        setPending(true);
                    })(evt);
                }}
            >
                <h2 className='text-4xl font-bold'>Create Quiz</h2>
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <CreateQuestions form={form} />
                <div className="flex items-center gap-4">
                    <Button>Submit</Button>
                    {pending && (
                        <Loader2 className="animate-spin size-4 " />
                    )}
                </div>
                <FormMessage className={cn(success && "text-green-500")}>
                    {state.message}
                </FormMessage>
            </form>
        </Form >
    )
}
