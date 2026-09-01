"use client";

import { CircleAlert } from "lucide-react";
import { IQuestion } from "@/types/form";

export function QuestionCard({
  question,
  error,
  children,
}: {
  question: IQuestion;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-question-id={question.id}
      className="rounded-lg border bg-background p-6"
    >
      <label
        id={`${question.id}-label`}
        htmlFor={question.id}
        className="block text-base"
      >
        {question.title}
        {question.required && (
          <span className="ml-1 text-red-600" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {question.description && (
        <p className="mt-1 text-sm text-muted-foreground">
          {question.description}
        </p>
      )}

      <div className="mt-4">{children}</div>

      {error && (
        <p
          id={`${question.id}-error`}
          role="alert"
          className="mt-2 flex items-center gap-1.5 text-sm text-red-600"
        >
          <CircleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
