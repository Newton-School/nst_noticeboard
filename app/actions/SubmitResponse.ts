"use server";

import { ObjectId } from "mongodb";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { hasAlreadyResponded, loadForm } from "@/lib/forms";
import { validateAnswers } from "@/lib/form-validation";
import { AnswerValue, IQuestion, SubmitState } from "@/types/form";

function readAnswer(question: IQuestion, formData: FormData): AnswerValue {
  if (question.type === "CHECKBOXES") {
    return formData.getAll(question.id).map((value) => value.toString());
  }
  return (formData.get(question.id) ?? "").toString().trim();
}

export async function submitResponse(
  formId: string,
  _prevState: SubmitState,
  formData: FormData,
): Promise<SubmitState> {
  const form = await loadForm(formId);

  if (!form) {
    return {
      status: "error",
      errors: {},
      message: "This form no longer exists.",
    };
  }

  if (!form.acceptingResponses) {
    return { status: "error", errors: {}, message: form.closedMessage };
  }

  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return {
      status: "error",
      errors: {},
      message: "Please sign in to submit this form.",
    };
  }

  if (form.oneResponsePerUser && (await hasAlreadyResponded(formId, email))) {
    return {
      status: "error",
      errors: {},
      message: "You have already responded to this form.",
    };
  }

  const answers: Record<string, AnswerValue> = {};
  for (const question of form.questions) {
    answers[question.id] = readAnswer(question, formData);
  }

  const errors = validateAnswers(form.questions, answers);
  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  await (await getDb()).collection("formResponse").insertOne({
    form: new ObjectId(formId),
    answers,
    respondentEmail: email,
    submittedAt: new Date(),
  });

  return { status: "success" };
}
