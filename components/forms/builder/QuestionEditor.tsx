"use client";

import { ChevronDown, ChevronUp, CircleAlert, Copy, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  changeQuestionType,
  hasChoices,
} from "@/lib/form-schema";
import { cn } from "@/lib/utils";
import { FormErrors, IChoice, QuestionDraft, QuestionType } from "@/types/form";
import { ChoiceEditor } from "./ChoiceEditor";

function AnswerPreview({ type }: { type: QuestionType }) {
  const text =
    type === "PARAGRAPH"
      ? "Long answer text"
      : type === "DATE"
        ? "dd/mm/yyyy"
        : "Short answer text";

  return (
    <div
      className={cn(
        "max-w-md rounded-[10px] border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-400",
        type === "PARAGRAPH" ? "h-16" : "h-10",
      )}
    >
      {text}
    </div>
  );
}

export function QuestionEditor({
  question,
  index,
  total,
  errors,
  onChange,
  onMove,
  onDuplicate,
  onRemove,
}: {
  question: QuestionDraft;
  index: number;
  total: number;
  errors: FormErrors;
  onChange: (question: QuestionDraft) => void;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const error = errors[question.id];
  const titleId = `${question.id}-title`;
  const requiredId = `${question.id}-required`;

  function update(patch: Partial<QuestionDraft>) {
    onChange({ ...question, ...patch });
  }

  return (
    <div
      data-question-id={question.id}
      className={cn(
        "rounded-[10px] border bg-white p-5",
        error ? "border-red-400" : "border-[#E6E2D8]",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex-1 space-y-3">
          <label htmlFor={titleId} className="sr-only">
            Question {index + 1} title
          </label>
          <Input
            id={titleId}
            value={question.title}
            onChange={(event) => update({ title: event.target.value })}
            placeholder="Question"
            aria-invalid={Boolean(error)}
            className={cn(
              "text-base font-medium",
              error && "border-red-600 focus-visible:ring-red-600",
            )}
          />

          <Input
            value={question.description}
            onChange={(event) => update({ description: event.target.value })}
            placeholder="Description (optional)"
            aria-label={`Question ${index + 1} description`}
            className="text-sm"
          />
        </div>

        <div className="sm:w-52">
          <label htmlFor={`${question.id}-type`} className="sr-only">
            Question {index + 1} type
          </label>
          <select
            id={`${question.id}-type`}
            value={question.type}
            onChange={(event) =>
              onChange(
                changeQuestionType(question, event.target.value as QuestionType),
              )
            }
            className="h-10 w-full rounded-[10px] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {QUESTION_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4">
        {hasChoices(question.type) ? (
          <ChoiceEditor
            question={question}
            errors={errors}
            onChange={(choices: IChoice[]) => update({ choices })}
          />
        ) : (
          <AnswerPreview type={question.type} />
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 flex items-center gap-1.5 text-sm text-red-600"
        >
          <CircleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-[#E6E2D8] pt-3">
        <div className="flex items-center gap-2">
          <input
            id={requiredId}
            type="checkbox"
            checked={question.required}
            onChange={(event) => update({ required: event.target.checked })}
            className="size-4 rounded-lg accent-[#121316]"
          />
          <label htmlFor={requiredId} className="text-sm text-gray-700">
            Required
          </label>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            aria-label={`Move question ${index + 1} up`}
            className="rounded-[10px] p-1.5 text-gray-500 hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            aria-label={`Move question ${index + 1} down`}
            className="rounded-[10px] p-1.5 text-gray-500 hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronDown className="size-4" />
          </button>
          <button
            type="button"
            onClick={onDuplicate}
            aria-label={`Duplicate question ${index + 1}`}
            className="rounded-[10px] p-1.5 text-gray-500 hover:bg-gray-100 hover:text-black"
          >
            <Copy className="size-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Delete question ${index + 1}`}
            className="rounded-[10px] p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
