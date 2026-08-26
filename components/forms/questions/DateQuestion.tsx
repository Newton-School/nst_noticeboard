"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { QuestionProps } from "./types";

export function DateQuestion({
  question,
  value,
  invalid,
  onChange,
}: QuestionProps) {
  return (
    <Input
      id={question.id}
      name={question.id}
      type="date"
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
      aria-invalid={invalid}
      aria-describedby={invalid ? `${question.id}-error` : undefined}
      aria-required={question.required}
      className={cn(
        "max-w-xs",
        invalid && "border-red-600 focus-visible:ring-red-600",
      )}
    />
  );
}
