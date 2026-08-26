"use client";

import { QuestionProps } from "./types";

export function MultipleChoiceQuestion({
  question,
  value,
  invalid,
  onChange,
}: QuestionProps) {
  const selected = typeof value === "string" ? value : "";

  return (
    <div
      role="radiogroup"
      aria-labelledby={`${question.id}-label`}
      aria-invalid={invalid}
      aria-describedby={invalid ? `${question.id}-error` : undefined}
      aria-required={question.required}
      className="space-y-2"
    >
      {(question.choices ?? []).map((choice, index) => (
        <label
          key={choice.id}
          className="flex items-center gap-2.5 text-sm text-gray-800"
        >
          <input
            type="radio"
            id={index === 0 ? question.id : undefined}
            name={question.id}
            value={choice.id}
            checked={selected === choice.id}
            onChange={() => onChange(choice.id)}
            className="size-4 accent-[#121316]"
          />
          {choice.label}
        </label>
      ))}
    </div>
  );
}
