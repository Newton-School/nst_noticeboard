"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { choiceErrorKey, newChoice } from "@/lib/form-schema";
import { cn } from "@/lib/utils";
import { FormErrors, IChoice, QuestionDraft } from "@/types/form";

function ChoiceMarker({
  type,
  index,
}: {
  type: QuestionDraft["type"];
  index: number;
}) {
  if (type === "DROPDOWN") {
    return (
      <span className="w-5 shrink-0 text-sm text-gray-500 tabular-nums">
        {index + 1}.
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-4 shrink-0 border border-gray-400",
        type === "CHECKBOXES" ? "rounded-lg" : "rounded-full",
      )}
    />
  );
}

export function ChoiceEditor({
  question,
  errors,
  onChange,
}: {
  question: QuestionDraft;
  errors: FormErrors;
  onChange: (choices: IChoice[]) => void;
}) {
  const { choices } = question;

  function updateLabel(choiceId: string, label: string) {
    onChange(
      choices.map((choice) =>
        choice.id === choiceId ? { ...choice, label } : choice,
      ),
    );
  }

  return (
    <div className="space-y-2">
      {choices.map((choice, index) => {
        const error = errors[choiceErrorKey(question.id, choice.id)];

        return (
          <div key={choice.id} className="flex items-center gap-2">
            <ChoiceMarker type={question.type} index={index} />

            <Input
              value={choice.label}
              onChange={(event) => updateLabel(choice.id, event.target.value)}
              placeholder={`Option ${index + 1}`}
              aria-label={`Option ${index + 1}`}
              aria-invalid={Boolean(error)}
              className={cn(
                "max-w-md",
                error && "border-red-600 focus-visible:ring-red-600",
              )}
            />

            <button
              type="button"
              onClick={() =>
                onChange(choices.filter((item) => item.id !== choice.id))
              }
              disabled={choices.length === 1}
              aria-label={`Remove option ${index + 1}`}
              className="rounded-[10px] p-1.5 text-gray-500 hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={() => onChange([...choices, newChoice(`Option ${choices.length + 1}`)])}
        className="inline-flex items-center gap-1.5 rounded-[10px] px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-100 hover:text-black"
      >
        <Plus className="size-4" />
        Add option
      </button>
    </div>
  );
}
