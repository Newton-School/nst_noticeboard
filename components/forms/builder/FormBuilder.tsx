"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CircleAlert, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { saveForm } from "@/app/actions/SaveForm";
import {
  FORM_QUESTIONS_KEY,
  FORM_TITLE_KEY,
  newQuestion,
  validateFormDraft,
} from "@/lib/form-schema";
import { cn } from "@/lib/utils";
import { FormDraft, FormErrors, QuestionDraft } from "@/types/form";
import { QuestionEditor } from "./QuestionEditor";

export default function FormBuilder({
  formId,
  initialDraft,
}: {
  formId: string | null;
  initialDraft: FormDraft;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [draft, setDraft] = useState<FormDraft>(initialDraft);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<FormDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setSaved(false);
  }

  function clearErrors(...keys: string[]) {
    setErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(next)) {
        if (keys.includes(key) || keys.some((k) => key.startsWith(`${k}:`))) {
          delete next[key];
        }
      }
      return next;
    });
  }

  function updateQuestion(index: number, question: QuestionDraft) {
    clearErrors(question.id);
    update({
      questions: draft.questions.map((item, i) =>
        i === index ? question : item,
      ),
    });
  }

  function moveQuestion(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= draft.questions.length) return;

    const questions = [...draft.questions];
    [questions[index], questions[target]] = [questions[target], questions[index]];
    update({ questions });
  }

  function addQuestion() {
    clearErrors(FORM_QUESTIONS_KEY);
    update({ questions: [...draft.questions, newQuestion()] });
  }

  function duplicateQuestion(index: number) {
    const source = draft.questions[index];
    const copy = { ...newQuestion(source.type), ...source, id: newQuestion().id };
    const questions = [...draft.questions];
    questions.splice(index + 1, 0, copy);
    update({ questions });
  }

  function removeQuestion(index: number) {
    update({ questions: draft.questions.filter((_, i) => i !== index) });
  }

  function handleSave() {
    const found = validateFormDraft(draft);
    setErrors(found);
    setMessage(null);

    if (Object.keys(found).length > 0) {
      const firstQuestion = draft.questions.find((q) => found[q.id]);
      if (firstQuestion) {
        document
          .querySelector(`[data-question-id="${CSS.escape(firstQuestion.id)}"]`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    startTransition(async () => {
      const result = await saveForm(formId, JSON.stringify(draft));

      if (result.status === "saved") {
        setSaved(true);
        if (formId === null) {
          router.replace(`/admin/forms/${result.formId}`);
        } else {
          router.refresh();
        }
        return;
      }

      if (result.status === "error") {
        setErrors(result.errors);
        setMessage(result.message ?? null);
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
      <div className="rounded-[10px] border border-[#E6E2D8] bg-white p-5">
        <label htmlFor="form-title" className="sr-only">
          Form title
        </label>
        <Input
          id="form-title"
          value={draft.title}
          onChange={(event) => {
            clearErrors(FORM_TITLE_KEY);
            update({ title: event.target.value });
          }}
          placeholder="Form title"
          aria-invalid={Boolean(errors[FORM_TITLE_KEY])}
          className={cn(
            "text-lg font-bold",
            errors[FORM_TITLE_KEY] &&
              "border-red-600 focus-visible:ring-red-600",
          )}
        />
        {errors[FORM_TITLE_KEY] && (
          <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
            <CircleAlert size={16} aria-hidden="true" />
            {errors[FORM_TITLE_KEY]}
          </p>
        )}

        <Input
          value={draft.description}
          onChange={(event) => update({ description: event.target.value })}
          placeholder="Form description (optional)"
          aria-label="Form description"
          className="mt-3 text-sm"
        />

      </div>

      {draft.questions.map((question, index) => (
        <QuestionEditor
          key={question.id}
          question={question}
          index={index}
          total={draft.questions.length}
          errors={errors}
          onChange={(next) => updateQuestion(index, next)}
          onMove={(direction) => moveQuestion(index, direction)}
          onDuplicate={() => duplicateQuestion(index)}
          onRemove={() => removeQuestion(index)}
        />
      ))}

      {errors[FORM_QUESTIONS_KEY] && (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-red-600">
          <CircleAlert size={16} aria-hidden="true" />
          {errors[FORM_QUESTIONS_KEY]}
        </p>
      )}

      <button
        type="button"
        onClick={addQuestion}
        className="inline-flex items-center gap-1.5 rounded-[10px] border border-dashed border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-white hover:text-black"
      >
        <Plus className="size-4" />
        Add question
      </button>

      {message && (
        <p role="alert" className="text-sm text-red-600">
          {message}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-[#E6E2D8] pt-4">
        <Button type="button" onClick={handleSave} disabled={pending}>
          {pending ? "Saving..." : "Save form"}
        </Button>

        {formId && (
          <Link
            href={`/forms/${formId}`}
            target="_blank"
            className={buttonVariants({ variant: "outline" })}
          >
            Preview
          </Link>
        )}

        {saved && <span className="text-sm text-green-700">Saved</span>}
      </div>
    </div>
  );
}
