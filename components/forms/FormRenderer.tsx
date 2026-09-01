"use client";

import { useActionState, useRef, useState } from "react";
import { submitResponse } from "@/app/actions/SubmitResponse";
import { AnswerValue, FormErrors, IForm, SubmitState } from "@/types/form";
import { emptyAnswerFor, validateAnswers } from "@/lib/form-validation";
import { QuestionCard } from "./QuestionCard";
import { getQuestionComponent } from "./questions/registry";

const INITIAL_STATE: SubmitState = { status: "idle" };

export default function FormRenderer({ form }: { form: IForm }) {
  const [attempt, setAttempt] = useState(0);

  return (
    <FormFill
      key={attempt}
      form={form}
      onSubmitAnother={() => setAttempt((value) => value + 1)}
    />
  );
}

function FormFill({
  form,
  onSubmitAnother,
}: {
  form: IForm;
  onSubmitAnother: () => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  const [answers, setAnswers] = useState<Record<string, AnswerValue>>(() =>
    Object.fromEntries(form.questions.map((q) => [q.id, emptyAnswerFor(q)])),
  );
  const [clientErrors, setClientErrors] = useState<FormErrors>({});
  const [cleared, setCleared] = useState<string[]>([]);

  const [state, formAction, pending] = useActionState(
    submitResponse.bind(null, String(form._id)),
    INITIAL_STATE,
  );

  const serverErrors = state.status === "error" ? state.errors : {};
  const errors: FormErrors = Object.fromEntries(
    Object.entries({ ...serverErrors, ...clientErrors }).filter(
      ([questionId]) => !cleared.includes(questionId),
    ),
  );

  function handleChange(questionId: string, value: AnswerValue) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setCleared((current) =>
      current.includes(questionId) ? current : [...current, questionId],
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const found = validateAnswers(form.questions, answers);
    setCleared([]);
    setClientErrors(found);

    if (Object.keys(found).length === 0) return;

    event.preventDefault();
    const first = form.questions.find((q) => found[q.id]);
    if (!first) return;
    formRef.current
      ?.querySelector(`[data-question-id="${CSS.escape(first.id)}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
    formRef.current
      ?.querySelector<HTMLElement>(`[name="${CSS.escape(first.id)}"]`)
      ?.focus();
  }

  if (state.status === "success") {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-4 px-4 py-10">
        <div className="rounded-lg border bg-background p-6">
          <h1 className="text-2xl">{form.title}</h1>
          <p className="mt-4 text-sm">{form.confirmationMessage}</p>
          {!form.oneResponsePerUser && (
            <button
              type="button"
              onClick={onSubmitAnother}
              className="mt-4 text-sm text-blue-700 underline underline-offset-4"
            >
              Submit another response
            </button>
          )}
        </div>
      </section>
    );
  }

  const hasRequired = form.questions.some((q) => q.required);

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto w-full max-w-2xl space-y-4 px-4 py-10"
    >
      <header className="rounded-lg border bg-background p-6">
        <h1 className="text-2xl">{form.title}</h1>
        {form.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {form.description}
          </p>
        )}
        {hasRequired && (
          <p className="mt-4 text-sm text-red-600">
            * Indicates required question
          </p>
        )}
      </header>

      {form.questions.map((question) => {
        const Field = getQuestionComponent(question.type);
        if (!Field) return null;

        return (
          <QuestionCard
            key={question.id}
            question={question}
            error={errors[question.id]}
          >
            <Field
              question={question}
              value={answers[question.id] ?? emptyAnswerFor(question)}
              invalid={Boolean(errors[question.id])}
              onChange={(value) => handleChange(question.id, value)}
            />
          </QuestionCard>
        );
      })}

      {state.status === "error" && state.message && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </form>
  );
}
