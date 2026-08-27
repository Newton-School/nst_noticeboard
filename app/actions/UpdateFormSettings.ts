"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { DEFAULT_SETTINGS } from "@/lib/forms";
import { FormSettings, SettingsState } from "@/types/form";

export async function updateFormSettings(
  formId: string,
  settings: FormSettings,
): Promise<SettingsState> {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return { status: "error", message: "You are not signed in as an admin." };
  }

  if (!ObjectId.isValid(formId)) {
    return { status: "error", message: "This form no longer exists." };
  }

  if (typeof settings !== "object" || settings === null) {
    return { status: "error", message: "Those settings could not be read." };
  }

  const text = (value: unknown, fallback: string) =>
    typeof value === "string" && value.trim() ? value.trim() : fallback;

  const fields: FormSettings = {
    acceptingResponses: settings.acceptingResponses !== false,
    oneResponsePerUser: settings.oneResponsePerUser === true,
    confirmationMessage: text(
      settings.confirmationMessage,
      DEFAULT_SETTINGS.confirmationMessage,
    ),
    closedMessage: text(settings.closedMessage, DEFAULT_SETTINGS.closedMessage),
  };

  const result = await (await getDb())
    .collection("form")
    .updateOne(
      { _id: new ObjectId(formId) },
      { $set: { ...fields, updatedAt: new Date() } },
    );

  if (result.matchedCount === 0) {
    return { status: "error", message: "This form no longer exists." };
  }

  revalidatePath("/admin/forms");
  revalidatePath(`/admin/forms/${formId}`);
  revalidatePath(`/admin/forms/${formId}/settings`);
  revalidatePath(`/forms/${formId}`);

  return { status: "saved" };
}
