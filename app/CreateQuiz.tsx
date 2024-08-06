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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { createQuiz } from "./actions";
import CreateQuestions from "./CreateQuestions";
import { NewQuiz, newQuizSchema } from "./type";

const defaultValues = {
    title: '', description: '', questions: [{
        description: '', variants: [{ text: '' }], answer: 0
    }]
};

export default function CreateQuiz() {
    const [pending, setPending] = useState(false);
    const [state, dispatch] = useFormState(createQuiz, {});

    const form = useForm<NewQuiz>({ resolver: zodResolver(newQuizSchema), defaultValues });
    const onSubmit = form.handleSubmit(x => { setPending(true); dispatch(x); });

    const formRef = useRef<HTMLFormElement>(null);
    useEffect(() => { setPending(false); }, [state]);

    return (
        <Form {...form}>
            <form ref={formRef} className="space-y-4 max-w-96" onSubmit={onSubmit}>
                <h2 className='text-4xl font-bold'>Create Quiz</h2>
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input {...field} className="aria-[invalid=true]:border-destructive" />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input {...field} className="aria-[invalid=true]:border-destructive" />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <CreateQuestions form={form} formRef={formRef} />
                <div className="flex items-center gap-4">
                    <Button>Submit</Button>
                    {pending ? (
                        <Loader2 className="animate-spin size-4 " />
                    ) : state.success === true ? (
                        <FormMessage className='text-green-500'>Done</FormMessage>
                    ) : state.success === false ? (
                        <FormMessage>Error</FormMessage>
                    ) : undefined}
                </div>
            </form>
        </Form >
    )
}
