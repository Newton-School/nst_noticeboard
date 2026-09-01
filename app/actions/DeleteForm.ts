"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { getDb } from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    throw new Error("Unauthorized access");
  }
}

export async function deleteForm(formId: string): Promise<void> {
  await requireAdmin();

  if (!ObjectId.isValid(formId)) {
    throw new Error("This form no longer exists");
  }

  const db = await getDb();
  const _id = new ObjectId(formId);

  const result = await db.collection("form").deleteOne({ _id });
  if (result.deletedCount === 0) {
    throw new Error("This form no longer exists");
  }

  await db.collection("formResponse").deleteMany({ form: _id });

  revalidatePath("/admin/forms");
  revalidatePath(`/forms/${formId}`);
}

export async function setAcceptingResponses(
  formId: string,
  accepting: boolean,
): Promise<void> {
  await requireAdmin();

  if (!ObjectId.isValid(formId)) {
    throw new Error("This form no longer exists");
  }

  const result = await (await getDb())
    .collection("form")
    .updateOne(
      { _id: new ObjectId(formId) },
      { $set: { acceptingResponses: accepting, updatedAt: new Date() } },
    );

  if (result.matchedCount === 0) {
    throw new Error("This form no longer exists");
  }

  revalidatePath("/admin/forms");
  revalidatePath(`/admin/forms/${formId}`);
  revalidatePath(`/forms/${formId}`);
}
