"use server";

import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function addCategory(formData: FormData) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return { error: "Unauthorized access" };
  }

  const name = formData.get("name")?.toString()?.trim();
  const description = formData.get("description")?.toString()?.trim() || "";
  const icon = formData.get("icon")?.toString()?.trim() || "FileText";
  const color = formData.get("color")?.toString()?.trim() || "blue";

  if (!name) {
    return { error: "Category name is required" };
  }

  try {
    const db = await getDb();
    const result = await db.collection("category").insertOne({
      name,
      description,
      icon,
      color,
    });

    revalidatePath("/policy");
    revalidatePath("/admin/policy");
    revalidatePath("/policies");

    return {
      success: true,
      category: {
        _id: result.insertedId.toString(),
        name,
        description,
        icon,
        color,
      },
    };
  } catch (err) {
    console.error("Error adding category:", err);
    return { error: "Failed to create category. Please try again." };
  }
}