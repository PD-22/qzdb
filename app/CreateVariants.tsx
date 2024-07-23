"use client"

import { Checkbox } from "@/components/ui/checkbox";
import {
    FormControl,
    FormField,
    FormItem
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { NewQuiz } from "./type";

export default function CreateVariants({
    form,
    questionIndex
}: {
    form: UseFormReturn<NewQuiz>,
    questionIndex: number
}) {
    const { fields } = useFieldArray({
        control: form.control,
        name: `questions.${questionIndex}.variants`
    });

    return (
        <div className="space-y-2">
            {fields.map((field, index) => (
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
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            ))}
        </div >
    )
}
