import React from "react";
import { getDb } from "@/lib/db";
import { auth } from "@/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileText, ShieldAlert, Download, ExternalLink, Calendar } from "lucide-react";
import Link from "next/link";

interface PolicyItem {
  _id?: string;
  title: string;
  description: string;
  categoryName?: string;
  pdfUrl?: string;
  updatedAt?: string;
}

export default async function PoliciesPage() {
  const session = await auth();
  let policies: PolicyItem[] = [];

  try {
    const db = await getDb();
    const rawPolicies = await db.collection("policy").find({}).toArray();
    const categories = await db.collection("category").find({}).toArray();

    const categoryMap = new Map(
      categories.map((c) => [c._id.toString(), c.name])
    );

    policies = rawPolicies.map((p) => {
      let categoryId = "";
      if (p.category) {
        categoryId =
          typeof p.category === "object" && p.category !== null && "_id" in p.category
            ? (p.category as { _id: { toString: () => string } })._id.toString()
            : p.category.toString();
      } else if (p.categoryId) {
        categoryId = p.categoryId.toString();
      }

      return {
        _id: p._id?.toString(),
        title: p.title || p.name || "Untitled Policy",
        description: p.description || "Official institutional policy guidelines.",
        categoryName: categoryId ? categoryMap.get(categoryId) || "General" : "General",
        pdfUrl: p.pdfUrl || p.file_link || "",
        updatedAt: p.updatedAt
          ? new Date(p.updatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Latest",
      };
    });
  } catch (err) {
    console.error("Error fetching policies for /policies page:", err);
  }

  return (
    <div className="bg-[#F5F0E6] min-h-screen p-3 sm:p-4 font-sans antialiased text-[#0d0e12] relative overflow-x-hidden">
      {/* INNER FRAMED CANVAS CONTAINER */}
      <div className="w-full max-w-[1480px] mx-auto bg-white rounded-[24px] sm:rounded-[28px] overflow-hidden relative min-h-[calc(100vh-2rem)] flex flex-col justify-between">
        <div>
          {/* NAVBAR AT TOP CENTER */}
          <Navbar activeTab="policies" user={session?.user} />

          {/* MAIN BODY WRAPPER */}
          <div className="pt-24 sm:pt-28 pb-12 w-full">
            <main className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Page Header */}
              <div className="bg-[#FAF9F6] border border-[#E6E2D8]/80 rounded-[28px] p-6 sm:p-8 shadow-xs mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-3">
                      <ShieldAlert className="w-3.5 h-3.5" /> Official Governance & Standards
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[#0d0e12] tracking-tight">
                      Institutional Policies & Rules
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium max-w-xl">
                      Browse official university guidelines, academic integrity codes, attendance requirements, and campus regulations.
                    </p>
                  </div>

                  {/* Quick Count Badge */}
                  <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#E6E2D8] shadow-2xs">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Documents</p>
                      <p className="text-lg font-black text-[#0d0e12]">{policies.length} Policies Available</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policies List / Empty State */}
              {policies.length === 0 ? (
                <div className="bg-[#FAF9F6] border border-[#E6E2D8]/80 rounded-[24px] p-12 text-center space-y-3 shadow-xs">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-800">No Policies Published Yet</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Institutional policies and code of conduct manuals will appear here once published by the administration.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {policies.map((policy) => (
                    <div
                      key={policy._id}
                      className="bg-[#FAF9F6] border border-[#E6E2D8]/80 hover:border-blue-300 rounded-[24px] p-6 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                            {policy.categoryName}
                          </span>
                          <span className="text-[11px] font-medium text-[#0d0e12] flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Updated {policy.updatedAt}
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-[#0d0e12] leading-snug mb-2">
                          {policy.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4 line-clamp-3">
                          {policy.description}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                        <Link
                          href={`/policy?id=${policy._id}`}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline"
                        >
                          Read Full Document <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {policy.pdfUrl && (
                          <a
                            href={`/api/download?url=${encodeURIComponent(policy.pdfUrl)}`}
                            className="px-3.5 py-2 rounded-xl bg-[#121316] hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>

        {/* Footer Landscape Banner */}
        <Footer />
      </div>
    </div>
  );
}
