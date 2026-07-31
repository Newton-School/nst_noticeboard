"use server";

import { read, utils } from "xlsx";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { auth } from "@/auth";
import { ActionResponse, ExcelUserRow, ImportSummary  } from "@/types/excel";

export async function uploadUsersFromExcel(formData: FormData) : Promise<ActionResponse<ImportSummary>> {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return { success: false, error: "Unauthorized access" };
  }

  const file = formData.get("file") as File;
  if (!file) {
    return { success: false, error: "No file provided" };
  }

  try {
    const db = await getDb();
    const usersCollection = db.collection("users");

    await usersCollection.createIndex({ email: 1 }, { unique: true });

    const bytes = await file.arrayBuffer();
    const workbook = read(bytes, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheetData = utils.sheet_to_json<ExcelUserRow>(workbook.Sheets[sheetName]);

    let createdCount = 0;
    let skippedCount = 0;

    for (const row of sheetData) {
      const email = (row.Email || row.email || "").trim().toLowerCase();
      const name = row.Name || row.name || "User";
      const rawPassword = row.Password || row.password;

      if (!email) {
        skippedCount++;
        continue;
      }

      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        skippedCount++;
        continue;
      }

      const hashedPassword = rawPassword
        ? await bcrypt.hash(String(rawPassword), 10)
        : null;

      await usersCollection.insertOne({
        name,
        email,
        password: hashedPassword,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      createdCount++;
    }

    return {
      success: true,
      message: `Successfully created ${createdCount} users. Skipped ${skippedCount} existing or invalid rows.`,
    };
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(JSON.stringify(error));
    return { success: false, error: err.message || "Failed to process file" };
  }
}