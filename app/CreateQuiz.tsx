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
import { useMemo, useRef } from "react";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { createQuiz } from "./actions";
import { NewQuiz, NewQuizFields, newQuizSchema } from "./type";

export default function CreateQuiz() {
    const [state, dispatch] = useFormState(createQuiz, { message: '' });

    const stateErrors = useMemo(() => mapValues(
        pickBy(state.issues ?? {}, v => v !== undefined),
        m => ({ type: '', message: m })
    ), [state.issues]);

    const defaultValues: NewQuizFields = {
        title: '', description: '',
        ...(state.fields) ?? {}
    };

    const form = useForm<NewQuiz>({
        resolver: zodResolver(newQuizSchema),
        defaultValues,
        errors: stateErrors
    });

    const formRef = useRef<HTMLFormElement>(null);

    return (
        <Form {...form}>
            <form
                ref={formRef}
                className="space-y-4 max-w-80"
                action={dispatch}
                onSubmit={async evt => {
                    evt.preventDefault();
                    await form.handleSubmit(() => {
                        const form = formRef.current ?? undefined;
                        dispatch(new FormData(form));
                    })(evt);
                }}
            >
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
                <Button type="submit">Submit</Button>
                <FormMessage className={cn(!state.issues && "text-green-500")}>
                    {state.message}
                </FormMessage>
            </form>
        </Form >
    )
}
