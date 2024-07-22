import { Button } from "@/components/ui/button";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { NewQuiz } from "./type";

export default function CreateQuestions({ form }: { form: UseFormReturn<NewQuiz> }) {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'questions'
    });

    return (
        <div className="space-y-2">
            <FormLabel>Questions</FormLabel>
            <FormMessage>
                {form.formState.errors.questions?.root?.message}
            </FormMessage>
            {fields.map((field, index, { length }) => (
                <FormField
                    key={field.id}
                    control={form.control}
                    name={`questions.${index}.description`}
                    render={({ field }) => (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <FormControl><Input {...field} /></FormControl>
                                <Button
                                    variant='outline'
                                    size='icon'
                                    className="size-8 min-w-8"
                                    disabled={length <= 1}
                                    onClick={() => remove(index)}
                                >
                                    <Minus className="size-4" />
                                </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            ))}
            <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl><Input disabled /></FormControl>
                <Button
                    variant='outline'
                    size='icon'
                    className="size-8 min-w-8"
                    onClick={() => append({ description: '' })}
                >
                    <Plus className="size-4" />
                </Button>
                <FormMessage />
            </FormItem>
        </div>
    )
}