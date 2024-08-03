"use client"

import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { last } from "lodash";
import { ArrowDown, ArrowUp, Minus, Plus } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import CreateVariants from "./CreateVariants";
import { NewQuiz } from "./type";

const icon = {
    variant: 'outline',
    type: 'button',
    size: 'icon',
    className: 'min-w-10',
} as const;

export default function CreateQuestions({ form }: { form: UseFormReturn<NewQuiz> }) {
    const { fields, append, remove, swap, update } = useFieldArray({
        control: form.control,
        name: 'questions'
    });

    const lastQuestion = last(form.watch('questions'));

    return (
        <div className="space-y-2">
            <div className='text-sm font-medium'>Questions</div>
            <FormMessage>{form.formState.errors.questions?.message}</FormMessage>
            <div className="space-y-4">
                {fields.map((field, index, { length }) => (
                    <FormField
                        key={field.id}
                        control={form.control}
                        name={`questions.${index}.description`}
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex gap-2">
                                    <FormControl><Input {...field} /></FormControl>
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
                                        onClick={() => {
                                            if (length > 1) return remove(index);
                                            update(index, { description: '', variants: [{ text: '' }], answer: 0 });
                                        }}
                                    >
                                        <Minus className="size-4" />
                                    </Button>
                                </div>
                                <FormMessage />
                                <CreateVariants form={form} questionIndex={index} />
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
                    <FormMessage />
                </FormItem>
            </div>
        </div >
    )
}
