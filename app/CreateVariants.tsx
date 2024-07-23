"use client"

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    FormControl,
    FormField,
    FormItem
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Check, Minus, Plus } from "lucide-react";
import { useFieldArray, UseFormReturn, useWatch } from "react-hook-form";
import { z } from "zod";
import { NewQuiz, newQuizFieldsSchema } from "./type";

export default function CreateVariants({
    form,
    questionIndex
}: {
    form: UseFormReturn<NewQuiz>,
    questionIndex: number
}) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: `questions.${questionIndex}.variants`
    });

    const variants = z
        .array(newQuizFieldsSchema.shape.questions.element.shape.variants.element)
        .parse(useWatch({ name: `questions.${questionIndex}.variants` }));

    return (
        <div className="space-y-2">
            {fields.map((field, index, { length }) => (
                <div key={field.id} className="flex gap-2">
                    <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.variants.${index}.status`}
                        render={({ field }) => (
                            <FormItem className="flex">
                                <FormControl>
                                    <Checkbox
                                        className="size-10 rounded-md border-input"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    >
                                        <Check className="size-6" />
                                    </Checkbox>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.variants.${index}.text`}
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <div className="flex items-center gap-2">
                                    <FormControl>
                                        <Input {...field} onBlur={() => {
                                            field.onBlur();
                                            if (
                                                (index < length - 1) &&
                                                (length > 1) &&
                                                (!field.value)
                                            ) remove(index);
                                        }} />
                                    </FormControl>
                                    <div className="min-w-10 h-10 flex justify-center items-center">
                                        <Button
                                            variant='secondary'
                                            type='button'
                                            size='icon'
                                            className='size-8'
                                            disabled={length <= 1}
                                            onClick={() => remove(index)}
                                        >
                                            <Minus className="size-3" />
                                        </Button>
                                    </div>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>
            ))}
            <FormItem className="flex items-center gap-2 space-y-0">
                <Checkbox className="size-10 rounded-md border-input" disabled>
                    <Check className="size-6" />
                </Checkbox>
                <FormControl>
                    <Input disabled placeholder="Add a new variant" />
                </FormControl>
                <div className="min-w-10 h-10 flex justify-center items-center">
                    <Button
                        variant='secondary'
                        type='button'
                        size='icon'
                        className='size-8'
                        disabled={variants.some(q => !q.text.trim().length)}
                        onClick={() => append({ text: '', status: false })}
                    >
                        <Plus className="size-3" />
                    </Button>
                </div>
            </FormItem>
        </div>
    );
}
