"use client"

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { clamp, isEqual, last } from "lodash";
import { ArrowDown, ArrowUp, Minus, Plus } from "lucide-react";
import { RefObject, useEffect, useState } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import CreateVariants from "./CreateVariants";
import { NewQuiz } from "./type";

const icon = {
    variant: 'outline',
    type: 'button',
    size: 'icon',
    className: 'min-w-10',
} as const;

export default function CreateQuestions({
    form,
    formRef
}: {
    form: UseFormReturn<NewQuiz>,
    formRef: RefObject<HTMLFormElement>,
}) {
    const { fields, append, remove, swap, update } = useFieldArray({
        control: form.control,
        name: 'questions'
    });

    const lastQuestion = last(form.watch('questions'));

    const [focusName, setFocusName] = useState<string | null>(null);
    useEffect(() => {
        if (!focusName) return;
        Array.from(document.getElementsByName(focusName))
            .find(e => formRef.current?.contains(e))
            ?.focus();
        setFocusName(null);
    }, [focusName, formRef]);

    return (
        <div className="space-y-2">
            <div
                className={cn(
                    'text-sm font-medium',
                    Boolean(form.formState.errors.questions) && 'text-destructive'
                )}
            >Questions</div>
            <div className="space-y-4">
                {fields.map((field, index, { length }) => (
                    <FormField
                        key={field.id}
                        control={form.control}
                        name={`questions.${index}.description`}
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex gap-2">
                                    <FormControl>
                                        <Input {...field} className='aria-[invalid=true]:border-destructive' />
                                    </FormControl>
                                    <Button {...icon}
                                        disabled={index - 1 < 0}
                                        onClick={() => swap(index, index - 1)}
                                    >
                                        <ArrowUp className="size-4" />
                                    </Button>
                                    <Button {...icon}
                                        disabled={index + 1 >= length}
                                        onClick={() => swap(index, index + 1)}
                                    >
                                        <ArrowDown className="size-4" />
                                    </Button>
                                    <Button {...icon}
                                        name={`questions.${index}.remove`}
                                        disabled={fields.length <= 1 && isEqual(
                                            form.getValues(`questions.${index}`),
                                            { description: '', variants: [{ text: '' }], answer: 0 }
                                        )}
                                        onClick={() => {
                                            if (length > 1) {
                                                remove(index);
                                                const focusIndex = clamp(index, 0, length - 2);
                                                setFocusName(`questions.${focusIndex}.remove`);
                                            } else {
                                                update(index, { description: '', variants: [{ text: '' }], answer: 0 });
                                                setFocusName(`questions.${index}.remove`);
                                            }
                                        }}
                                    >
                                        <Minus className="size-4" />
                                    </Button>
                                </div>
                                <CreateVariants form={form} formRef={formRef} questionIndex={index} />
                            </FormItem>
                        )}
                    />
                ))}
                <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                        <Input disabled placeholder="Add a new question" />
                    </FormControl>
                    <Button
                        variant='outline'
                        type='button'
                        size='icon'
                        className='min-w-10'
                        disabled={lastQuestion && !lastQuestion.description.trim()}
                        onClick={() => append({ description: '', variants: [{ text: '' }], answer: 0 })}
                    >
                        <Plus className="size-4" />
                    </Button>
                </FormItem>
            </div>
        </div >
    )
}
