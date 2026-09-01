import {
  FormDraft,
  FormErrors,
  IChoice,
  IForm,
  IQuestion,
  QuestionDraft,
  QuestionType,
} from "@/types/form";

export const FORM_TITLE_KEY = "form:title";
export const FORM_QUESTIONS_KEY = "form:questions";

export function choiceErrorKey(questionId: string, choiceId: string): string {
  return `${questionId}:${choiceId}`;
}

export const QUESTION_TYPES: QuestionType[] = [
  "SHORT_ANSWER",
  "PARAGRAPH",
  "MULTIPLE_CHOICE",
  "CHECKBOXES",
  "DROPDOWN",
  "DATE",
];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  SHORT_ANSWER: "Short answer",
  PARAGRAPH: "Paragraph",
  MULTIPLE_CHOICE: "Multiple choice",
  CHECKBOXES: "Checkboxes",
  DROPDOWN: "Dropdown",
  DATE: "Date",
};

const CHOICE_TYPES: QuestionType[] = [
  "MULTIPLE_CHOICE",
  "CHECKBOXES",
  "DROPDOWN",
];

export function hasChoices(type: QuestionType): boolean {
  return CHOICE_TYPES.includes(type);
}

export function isQuestionType(value: unknown): value is QuestionType {
  return (
    typeof value === "string" && QUESTION_TYPES.includes(value as QuestionType)
  );
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function newChoice(label = ""): IChoice {
  return { id: newId(), label };
}

export function newQuestion(type: QuestionType = "SHORT_ANSWER"): QuestionDraft {
  return {
    id: newId(),
    type,
    title: "",
    description: "",
    required: false,
    choices: hasChoices(type) ? [newChoice("Option 1")] : [],
  };
}

export function newFormDraft(): FormDraft {
  return {
    title: "",
    description: "",
    questions: [newQuestion()],
  };
}

export function draftFromForm(form: IForm): FormDraft {
  return {
    title: form.title ?? "",
    description: form.description ?? "",
    questions: (form.questions ?? []).map((question) => ({
      id: question.id,
      type: question.type,
      title: question.title ?? "",
      description: question.description ?? "",
      required: Boolean(question.required),
      choices: hasChoices(question.type) ? (question.choices ?? []) : [],
    })),
  };
}

export function changeQuestionType(
  question: QuestionDraft,
  type: QuestionType,
): QuestionDraft {
  if (!hasChoices(type)) return { ...question, type, choices: [] };

  const choices = question.choices.length
    ? question.choices
    : [newChoice("Option 1")];

  return { ...question, type, choices };
}

export function validateFormDraft(draft: FormDraft): FormErrors {
  const errors: FormErrors = {};

  if (!draft.title.trim()) {
    errors[FORM_TITLE_KEY] = "Give the form a title";
  }

  if (draft.questions.length === 0) {
    errors[FORM_QUESTIONS_KEY] = "Add at least one question";
  }

  for (const question of draft.questions) {
    if (!question.title.trim()) {
      errors[question.id] = "Give the question a title";
      continue;
    }

    if (!hasChoices(question.type)) continue;

    const filled = question.choices.filter((choice) => choice.label.trim());

    if (filled.length === 0) {
      errors[question.id] = "Add at least one option";
      continue;
    }

    for (const choice of question.choices) {
      if (!choice.label.trim()) {
        errors[choiceErrorKey(question.id, choice.id)] =
          "Option cannot be empty";
      }
    }

    const labels = filled.map((choice) => choice.label.trim().toLowerCase());
    if (new Set(labels).size !== labels.length) {
      errors[question.id] = "Options must be unique";
    }
  }

  return errors;
}

export function questionsFromDraft(draft: FormDraft): IQuestion[] {
  return draft.questions.map((question) => {
    const base: IQuestion = {
      id: question.id,
      type: question.type,
      title: question.title.trim(),
      description: question.description.trim(),
      required: question.required,
    };

    if (!hasChoices(question.type)) return base;

    return {
      ...base,
      choices: question.choices
        .filter((choice) => choice.label.trim())
        .map((choice) => ({ id: choice.id, label: choice.label.trim() })),
    };
  });
}

export function parseFormDraft(input: unknown): FormDraft | null {
  if (typeof input !== "object" || input === null) return null;

  const raw = input as Record<string, unknown>;
  if (!Array.isArray(raw.questions)) return null;

  const seen = new Set<string>();
  const questions: QuestionDraft[] = [];

  for (const entry of raw.questions) {
    if (typeof entry !== "object" || entry === null) return null;

    const item = entry as Record<string, unknown>;
    if (!isQuestionType(item.type)) return null;

    const id = typeof item.id === "string" && item.id ? item.id : newId();
    if (seen.has(id)) return null;
    seen.add(id);

    questions.push({
      id,
      type: item.type,
      title: readString(item.title),
      description: readString(item.description),
      required: item.required === true,
      choices: hasChoices(item.type) ? readChoices(item.choices) : [],
    });
  }

  return {
    title: readString(raw.title),
    description: readString(raw.description),
    questions,
  };
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readChoices(value: unknown): IChoice[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const choices: IChoice[] = [];

  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) continue;

    const item = entry as Record<string, unknown>;
    const id = typeof item.id === "string" && item.id ? item.id : newId();
    if (seen.has(id)) continue;
    seen.add(id);

    choices.push({ id, label: readString(item.label) });
  }

  return choices;
}
