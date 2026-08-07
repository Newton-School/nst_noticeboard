import { getDb } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import PolicyAdminManager from "@/components/policyAdminManager";

export default async function AdminPolicyPage() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    redirect("/signin");
  }

  const db = await getDb();

  const categoriesRaw = await db.collection("category").find({}).toArray();
  const categories = categoriesRaw.map((c) => ({
    _id: c._id.toString(),
    name: c.name as string,
    description: (c.description || "") as string,
  }));

  const policiesRaw = await db
    .collection("policy")
    .aggregate([
      {
        $lookup: {
          from: "category",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
    ])
    .toArray();

  const policies = policiesRaw.map((p) => ({
    ...p,
    _id: p._id.toString(),
    category: {
      ...p.category,
      _id: p.category._id.toString(),
    },
  }));

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-8 px-4 sm:px-8 md:px-12">
      <div className="max-w-310 mx-auto">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-gray-500 hover:text-black transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Portal
            </Link>
            <h1 className="text-3xl sm:text-[34px] font-extrabold text-[#0d0e12] tracking-tight">
              Admin Control Panel
            </h1>
            <p className="text-[14px] text-gray-500 mt-1 font-medium">
              Upload, edit, and delete official institutional policies.
            </p>
          </div>
          <Badge variant="outline" className="px-3.5 py-1.5 text-[12.5px] font-mono font-bold border-[#E6E2D8] bg-[#F4F2EC] text-gray-700 self-start sm:self-auto">
            Admin: {session.user?.email}
          </Badge>
        </div>

        {/* Content Manager component */}
        <PolicyAdminManager
          categories={categories}
          initialPolicies={JSON.parse(JSON.stringify(policies))}
        />
      </div>
    </div>
  );
}
