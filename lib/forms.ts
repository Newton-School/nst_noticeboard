import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import {
  FormSettings,
  FormSummary,
  IForm,
  IQuestion,
  ResponseRow,
} from "@/types/form";

export const DEFAULT_SETTINGS: FormSettings = {
  acceptingResponses: true,
  oneResponsePerUser: false,
  confirmationMessage: "Your response has been recorded.",
  closedMessage: "This form is no longer accepting responses.",
};

function readSettings(doc: Record<string, unknown>): FormSettings {
  const text = (value: unknown, fallback: string) =>
    typeof value === "string" && value.trim() ? value : fallback;

  return {
    acceptingResponses: doc.acceptingResponses !== false,
    oneResponsePerUser: doc.oneResponsePerUser === true,
    confirmationMessage: text(
      doc.confirmationMessage,
      DEFAULT_SETTINGS.confirmationMessage,
    ),
    closedMessage: text(doc.closedMessage, DEFAULT_SETTINGS.closedMessage),
  };
}

export async function loadForm(id: string): Promise<IForm | null> {
  if (!ObjectId.isValid(id)) return null;

  const db = await getDb();
  const doc = await db.collection("form").findOne({ _id: new ObjectId(id) });
  if (!doc) return null;

  const questions = Array.isArray(doc.questions)
    ? (doc.questions as IQuestion[])
    : [];

  return {
    _id: doc._id.toString(),
    title: (doc.title as string) || "Untitled form",
    description: (doc.description as string) || "",
    ...readSettings(doc),
    questions: questions.map((question) => ({
      id: question.id,
      type: question.type,
      title: question.title || "",
      description: question.description || "",
      required: Boolean(question.required),
      ...(question.choices ? { choices: question.choices } : {}),
    })),
    createdAt: new Date((doc.createdAt as Date) ?? Date.now()).toISOString(),
    updatedAt: new Date(
      (doc.updatedAt as Date) ?? (doc.createdAt as Date) ?? Date.now(),
    ).toISOString(),
  };
}

export async function listForms(): Promise<FormSummary[]> {
  const db = await getDb();

  const docs = await db
    .collection("form")
    .aggregate([
      { $sort: { updatedAt: -1, _id: -1 } },
      {
        $lookup: {
          from: "formResponse",
          localField: "_id",
          foreignField: "form",
          as: "responses",
        },
      },
      { $addFields: { responseCount: { $size: "$responses" } } },
      { $project: { responses: 0 } },
    ])
    .toArray();

  return docs.map((doc) => ({
    _id: doc._id.toString(),
    title: (doc.title as string) || "Untitled form",
    questionCount: Array.isArray(doc.questions) ? doc.questions.length : 0,
    responseCount: (doc.responseCount as number) ?? 0,
    acceptingResponses: doc.acceptingResponses !== false,
    updatedAt: new Date(
      (doc.updatedAt as Date) ?? (doc.createdAt as Date) ?? Date.now(),
    ).toISOString(),
  }));
}

export async function listResponses(formId: string): Promise<ResponseRow[]> {
  if (!ObjectId.isValid(formId)) return [];

  const db = await getDb();
  const docs = await db
    .collection("formResponse")
    .find({ form: new ObjectId(formId) })
    .sort({ submittedAt: -1 })
    .toArray();

  return docs.map((doc) => ({
    _id: doc._id.toString(),
    respondentEmail: (doc.respondentEmail as string) ?? null,
    submittedAt: new Date(
      (doc.submittedAt as Date) ?? Date.now(),
    ).toISOString(),
    answers: (doc.answers as ResponseRow["answers"]) ?? {},
  }));
}

export async function hasAlreadyResponded(
  formId: string,
  email: string,
): Promise<boolean> {
  const db = await getDb();
  const existing = await db.collection("formResponse").findOne({
    form: new ObjectId(formId),
    respondentEmail: email,
  });

  return existing !== null;
}
