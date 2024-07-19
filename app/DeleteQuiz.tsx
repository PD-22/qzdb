'use client';

import { Button } from "@/components/ui/button";
import { Loader2, Trash } from "lucide-react";
import { useFormStatus } from "react-dom";
import { deleteQuiz } from "./actions";

export default function DeleteQuiz({ id }: { id: number }) {
  return (
    <form
      action={deleteQuiz.bind(null, id)}
      className="flex ms-4"
    >
      <Submit />
    </form>
  );
}

function Submit() {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={pending}
      variant='outline'
      size='icon'
      className="size-8"
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Trash className="size-4" />
      )}
    </Button>
  );
}
