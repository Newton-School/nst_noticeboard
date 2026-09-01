"use client";

import { cn } from "@/lib/utils";
import { QuestionProps } from "./types";

export function DropdownQuestion({
  question,
  value,
  invalid,
  onChange,
}: QuestionProps) {
  return (
    <select
      id={question.id}
      name={question.id}
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={invalid}
      aria-describedby={invalid ? `${question.id}-error` : undefined}
      aria-required={question.required}
      className={cn(
        "h-10 w-full max-w-md rounded-[10px] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        invalid && "border-red-600 focus-visible:ring-red-600",
      )}
    >
      <option value="">Choose</option>
      {(question.choices ?? []).map((choice) => (
        <option key={choice.id} value={choice.id}>
          {choice.label}
        </option>
      ))}
    </select>
  );
}
