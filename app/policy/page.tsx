import { getDb } from "@/lib/db";
import { IPolicy } from "@/types/policy";
import { ObjectId } from "mongodb";
import PolicyClient from "./policyClient";

export const revalidate = 0;

async function PolicyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const policyId = resolvedSearchParams.id;
  if (typeof policyId != "string")
    throw new Error("Invalid Policy ID provided");

  const db = await getDb();

  const policiesRaw = await db
    .collection<IPolicy>("policy")
    .aggregate([
      {
        $match: {
          _id: new ObjectId(policyId),
        },
      },
      {
        $lookup: {
          from: "category",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    ])
    .next();

  if (!policiesRaw)
    throw new Error("No policy found with that ID");

  const policy: IPolicy = {
    _id: policiesRaw._id.toString(),
    title: policiesRaw.title || "",
    description: policiesRaw.description || "",
    pdfUrl: policiesRaw.pdfUrl || policiesRaw.file_link || "",
    fullContent: policiesRaw.fullContent || "",
    category: policiesRaw.category
      ? {
          _id: policiesRaw.category._id.toString(),
          name: policiesRaw.category.name || "General",
          description: policiesRaw.category.description || "",
          icon: policiesRaw.category.icon || "file-text",
          color: policiesRaw.category.color || "blue",
        }
      : {
          _id: "",
          name: "General",
          description: "",
          icon: "file-text",
          color: "blue",
        },
    updatedAt: policiesRaw.updatedAt
      ? new Date(policiesRaw.updatedAt).toISOString()
      : new Date().toISOString(),
    createdAt: policiesRaw.createdAt
      ? new Date(policiesRaw.createdAt).toISOString()
      : new Date().toISOString(),
  };

  return <PolicyClient policy={policy} />;
}

export default PolicyPage;
