"use client";

import { QuestionProps } from "./types";

export function CheckboxesQuestion({
  question,
  value,
  invalid,
  onChange,
}: QuestionProps) {
  const selected = Array.isArray(value) ? value : [];

  function toggle(choiceId: string, checked: boolean) {
    if (checked) {
      onChange([...selected, choiceId]);
    } else {
      onChange(selected.filter((id) => id !== choiceId));
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/role-supports-aria-props
    <div
      role="group"
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
            type="checkbox"
            id={index === 0 ? question.id : undefined}
            name={question.id}
            value={choice.id}
            checked={selected.includes(choice.id)}
            onChange={(event) => toggle(choice.id, event.target.checked)}
            className="size-4 rounded-lg accent-[#121316]"
          />
          {choice.label}
        </label>
      ))}
    </div>
  );
}
