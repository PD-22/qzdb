"use client"

import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { clamp, last } from "lodash";
import { Circle, Minus, Plus } from "lucide-react";
import { RefObject, useEffect, useMemo, useState } from "react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { NewQuiz } from "./type";

export default function CreateVariants({
    form,
    formRef,
    questionIndex
}: {
    form: UseFormReturn<NewQuiz>,
    formRef: RefObject<HTMLFormElement>,
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

    const [focusName, setFocusName] = useState<string | null>(null);
    useEffect(() => {
        if (!focusName) return;
        Array.from(document.getElementsByName(focusName))
            .find(e => formRef.current?.contains(e))
            ?.focus();
        console.log('focusName', focusName);
        setFocusName(null);
    }, [focusName]);

    const answerName = `questions.${questionIndex}.answer` as const;
    const answer = form.watch(answerName);
    const fixAns = answer < 0 || answer >= fields.length;
    const { setValue } = form;
    useEffect(() => {
        if (fixAns) setValue(answerName, 0);
    }, [fixAns, setValue, answerName]);

    return (
        <FormField
            control={form.control}
            name={answerName}
            render={({ field }) => (
                <div className="flex gap-2">
                    <RadioGroup
                        className="gap-2"
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
                            </FormItem>
                        ))}
                        <RadioGroupItem
                            value=''
                            className="size-8 border-input"
                            disabled
                        >
                            <Circle className="size-5 fill-current text-current" />
                        </RadioGroupItem>
                    </RadioGroup>
                    <div className="space-y-2 flex-auto">
                        {fields.map((field, index, { length }) => (
                            <FormItem key={field.id} className="flex items-center space-x-2 space-y-0">
                                <FormField
                                    control={form.control}
                                    name={`${baseName}.${index}.text`}
                                    render={({ field }) => (
                                        <FormItem className="flex-auto flex items-center gap-2 space-y-0">
                                            <FormControl>
                                                <Input {...field} className="h-8 aria-[invalid=true]:border-destructive" />
                                            </FormControl>
                                            <Button
                                                variant='outline'
                                                type='button'
                                                name={`${baseName}.${index}.remove`}
                                                size='icon'
                                                className='size-8 min-w-8 mx-1'
                                                disabled={!field.value}
                                                onClick={() => {
                                                    if (length > 1) {
                                                        remove(index);
                                                        const focusIndex = clamp(index, 0, length - 2);
                                                        setFocusName(`${baseName}.${focusIndex}.remove`);
                                                    } else {
                                                        update(index, { text: '' });
                                                        setFocusName(`${baseName}.${index}.remove`);
                                                    }
                                                }}
                                            >
                                                <Minus className="size-3" />
                                            </Button>
                                        </FormItem>
                                    )}
                                />
                            </FormItem>
                        ))}
                        <FormItem className="flex items-center space-x-2 space-y-0">
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
                    </div>
                </div>
            )}
        />
    );
}
