"use client"

import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormItem
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { last } from "lodash";
import { Circle, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FieldPath, useFieldArray, UseFormReturn } from "react-hook-form";
import { NewQuiz } from "./type";

export default function CreateVariants({
    form,
    questionIndex
}: {
    form: UseFormReturn<NewQuiz>,
    questionIndex: number
}) {
    const baseName = useMemo(() => `questions.${questionIndex}.variants` as const, [questionIndex]);
    const { fields: _fields, append, remove, update, replace } = useFieldArray({
        control: form.control,
        name: baseName
    });
    const watchedFields = form.watch(baseName);
    const fields = _fields.map((v, i) => ({ ...v, ...watchedFields[i] }));

    const lastVariant = last(fields);

    const [shouldFocus, setShouldFocus] = useState<FieldPath<NewQuiz> | null>(null);
    useEffect(() => {
        if (!shouldFocus) return;
        document.getElementById(shouldFocus)?.focus();
        setShouldFocus(null);
    }, [shouldFocus]);

    const answerName = `questions.${questionIndex}.answer` as const;
    const answer = form.watch(answerName);
    const fixAns = answer < 0 || answer >= fields.length;
    useEffect(() => { if (fixAns) form.setValue(answerName, 0); }, [fixAns]);

    return (
        <FormField
            control={form.control}
            name={answerName}
            render={({ field }) => (
                <RadioGroup
                    className="space-y-2"
                    required
                    loop
                    name={field.name}
                    onValueChange={(v: string) => field.onChange(Number(v))}
                    value={field.value.toString()}
                >
                    {fields.map((field, index, { length }) => (
                        <FormItem key={field.id} className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                                <RadioGroupItem
                                    className="size-8 border-input"
                                    value={`${index}`}
                                >
                                    <Circle className="size-5 fill-current text-current" />
                                </RadioGroupItem>
                            </FormControl>
                            <FormField
                                control={form.control}
                                name={`${baseName}.${index}.text`}
                                render={({ field }) => (
                                    <FormItem className="flex-auto flex items-center gap-2 space-y-0">
                                        <FormControl>
                                            <Input {...field} className="h-8" />
                                        </FormControl>
                                        <Button
                                            variant='outline'
                                            type='button'
                                            size='icon'
                                            className='size-8 min-w-8 mx-1'
                                            onClick={() => {
                                                if (length > 1) return remove(index);
                                                update(index, { text: '' });
                                            }}
                                        >
                                            <Minus className="size-3" />
                                        </Button>
                                    </FormItem>
                                )} />
                        </FormItem>
                    ))}
                    <FormItem className="flex items-center space-x-2 space-y-0">
                        <RadioGroupItem
                            value=''
                            className="size-8 border-input"
                            disabled
                        >
                            <Circle className="size-5 fill-current text-current" />
                        </RadioGroupItem>
                        <FormItem className="flex-auto flex items-center gap-2 space-y-0">
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
                                    const focusName = `${baseName}.${fields.length}.text`;
                                    append({ text: '' }, { focusName });
                                }}
                            >
                                <Plus className="size-3" />
                            </Button>
                        </FormItem>
                    </FormItem>
                </RadioGroup>
            )}
        />
    );
}
