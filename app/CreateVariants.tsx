"use client"

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { last } from "lodash";
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
    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: `questions.${questionIndex}.variants`
    });

    const lastVariant = last(z
        .array(newQuizFieldsSchema.shape.questions.element.shape.variants.element)
        .parse(useWatch({ name: `questions.${questionIndex}.variants` })));

    return (
        <div className="space-y-2">
            {fields.map((field, index, { length }) => (
                <div key={field.id}>
                    <div className="flex gap-2">
                        <FormField
                            control={form.control}
                            name={`questions.${questionIndex}.variants.${index}.status`}
                            render={({ field }) => (
                                <FormControl>
                                    <Checkbox
                                        {...field}
                                        value={undefined}
                                        className="size-8 rounded-md border-input"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    >
                                        <Check className="size-6" />
                                    </Checkbox>
                                </FormControl>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name={`questions.${questionIndex}.variants.${index}.text`}
                            render={({ field }) => (
                                <FormItem className="w-full flex items-center gap-2 space-y-0">
                                    <FormControl><Input {...field} className="h-8" /></FormControl>
                                    <Button
                                        variant='outline'
                                        type='button'
                                        size='icon'
                                        className='size-8 min-w-8 mx-1'
                                        onClick={() => {
                                            if (length > 1) return remove(index);
                                            update(index, { text: '', status: false });
                                        }}
                                    >
                                        <Minus className="size-3" />
                                    </Button>
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name={`questions.${questionIndex}.variants.${index}.text`}
                        render={() => <FormMessage />}
                    />
                </div>
            ))}
            <FormItem className="flex items-center gap-2 space-y-0">
                <Checkbox className="size-8 rounded-md border-input" disabled>
                    <Check className="size-6" />
                </Checkbox>
                <FormControl>
                    <Input className="h-8" disabled placeholder="Add a new variant" />
                </FormControl>
                <Button
                    variant='outline'
                    type='button'
                    size='icon'
                    className='size-8 min-w-8 mx-1'
                    disabled={lastVariant && !lastVariant.text.trim()}
                    onClick={() => {
                        const focusName = `questions.${questionIndex}.variants.${fields.length}.text`;
                        append({ text: '', status: false }, { focusName });
                    }}
                >
                    <Plus className="size-3" />
                </Button>
            </FormItem>
        </div>
    );
}
