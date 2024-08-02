"use client"

import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { last } from "lodash";
import { Circle, Minus, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FieldPath, useFieldArray, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { NewQuiz, newQuizFieldsSchema } from "./type";

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

    const variants = z
        .array(newQuizFieldsSchema.shape.questions.element.shape.variants.element)
        .parse(fields);
    const lastVariant = last(variants);

    const [shouldFocus, setShouldFocus] = useState<FieldPath<NewQuiz> | null>(null);
    useEffect(() => {
        if (!shouldFocus) return;
        document.getElementById(shouldFocus)?.focus();
        setShouldFocus(null);
    }, [shouldFocus]);

    const radioValue = (x => x >= 0 ? x : undefined)(variants.findIndex(x => x.status));

    const check = useCallback(
        (index: number) => {
            replace(fields.map(
                ({ status, ...rest }, i) => ({ ...rest, status: i === index })
            ));
            setShouldFocus(`${baseName}.${index}.status`);
        },
        [replace, fields, baseName]
    );

    const [shouldCheckSmth, setShouldCheckSmth] = useState(false);
    useEffect(() => {
        if (!radioValue && fields.length) {
            setShouldCheckSmth(true);
        }
    }, [radioValue, fields.length]);
    useEffect(() => {
        if (shouldCheckSmth) {
            setShouldCheckSmth(false);
            check(0);
        }
    }, [shouldCheckSmth, check]);

    return (
        <RadioGroup
            className="space-y-2"
            required
            loop
            value={radioValue?.toString()}
            onValueChange={(_index: string) => check(Number(_index))}
        >
            {fields.map((field, index, { length }) => (
                <div key={field.id}>
                    <input
                        type="hidden"
                        name={`${baseName}.${index}.status`}
                        value={Boolean(variants[index]?.status).toString()}
                    />
                    <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl id={`${baseName}.${index}.status`}>
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
                                            update(index, { text: '', status: false });
                                        }}
                                    >
                                        <Minus className="size-3" />
                                    </Button>
                                </FormItem>
                            )}
                        />
                    </FormItem>
                    <FormField
                        control={form.control}
                        name={`${baseName}.${index}.text`}
                        render={() => <FormMessage />}
                    />
                </div>
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
                            append({ text: '', status: false }, { focusName });
                        }}
                    >
                        <Plus className="size-3" />
                    </Button>
                </FormItem>
            </FormItem>
        </RadioGroup>
    );
}
