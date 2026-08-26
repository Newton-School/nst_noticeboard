"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import {
  parseFormDraft,
  questionsFromDraft,
  validateFormDraft,
} from "@/lib/form-schema";
import { SaveFormState } from "@/types/form";

function failure(message: string): SaveFormState {
  return { status: "error", errors: {}, message };
}

export async function saveForm(
  formId: string | null,
  draftJson: string,
): Promise<SaveFormState> {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return failure("You are not signed in as an admin.");
  }

  if (formId !== null && !ObjectId.isValid(formId)) {
    return failure("This form no longer exists.");
  }

  let payload: unknown;
  try {
    payload = JSON.parse(draftJson);
  } catch {
    return failure("The form could not be read. Please try again.");
  }

  const draft = parseFormDraft(payload);
  if (!draft) {
    return failure("The form could not be read. Please try again.");
  }

  const errors = validateFormDraft(draft);
  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  const db = await getDb();
  const now = new Date();

  const fields = {
    title: draft.title.trim(),
    description: draft.description.trim(),
    acceptingResponses: draft.acceptingResponses,
    questions: questionsFromDraft(draft),
    updatedAt: now,
  };

  let savedId: string;

  if (formId === null) {
    const result = await db
      .collection("form")
      .insertOne({ ...fields, createdAt: now });
    savedId = result.insertedId.toString();
  } else {
    const result = await db
      .collection("form")
      .updateOne({ _id: new ObjectId(formId) }, { $set: fields });

    if (result.matchedCount === 0) {
      return failure("This form no longer exists.");
    }
    savedId = formId;
  }

  revalidatePath("/admin/forms");
  revalidatePath(`/admin/forms/${savedId}`);
  revalidatePath(`/forms/${savedId}`);

  return { status: "saved", formId: savedId };
}
