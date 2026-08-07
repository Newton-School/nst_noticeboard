"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Mail,
  FileText,
  ChevronRight,
  ExternalLink,
  Info,
  Share2,
  Check,
  Building2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IPolicy } from "@/types/policy";

interface PolicyClientProps {
  policy?: IPolicy | null;
  initialPolicies?: IPolicy[];
  onBack?: () => void;
}

export default function PolicyClient({
  policy: singlePolicyProp,
  initialPolicies,
  onBack,
}: PolicyClientProps) {
  const [copied, setCopied] = useState(false);

  // Support either single policy prop or first policy from initialPolicies
  const targetPolicy =
    singlePolicyProp ||
    (initialPolicies && initialPolicies.length > 0 ? initialPolicies[0] : null);

  // If no policy found or passed
  if (!targetPolicy) {
    return (
      <div className="bg-[#FAF9F6] min-h-screen font-sans antialiased text-[#0d0e12] pb-24">
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-40 bg-white border-b border-[#E6E2D8] px-4 sm:px-8 md:px-12 py-4">
          <div className="max-w-310 mx-auto flex items-center justify-between">
            {onBack ? (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-[14px] font-bold text-[#0d0e12] hover:opacity-75 transition-opacity cursor-pointer border-0 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Directory
              </button>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-2 text-[14px] font-bold text-[#0d0e12] hover:opacity-75 transition-opacity"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            )}
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 mt-28 text-center space-y-4">
          <div className="w-16 h-16 bg-white border border-[#E6E2D8] rounded-[16px] flex items-center justify-center mx-auto shadow-2xs">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-[22px] font-extrabold text-[#0d0e12] tracking-tight">
            Policy Not Found
          </h2>
          <p className="text-[14px] text-gray-500 leading-relaxed">
            The requested policy details could not be found or retrieved. Please return to the directory or contact support.
          </p>
          <div className="pt-4 flex justify-center">
            <Link href="/" passHref legacyBehavior>
              <Button variant="secondary" className="font-bold px-6 py-2.5 cursor-pointer">
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Format link for iframe preview
  const getPreviewUrl = (url?: string) => {
    if (!url) return "";

    if (url.includes("drive.google.com")) {
      if (url.includes("/file/d/")) {
        const matches = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (matches && matches[1]) {
          return `https://drive.google.com/file/d/${matches[1]}/preview`;
        }
      }
      if (!url.endsWith("/preview")) {
        return url.replace(/\/view(\?.*)?$/, "") + "/preview";
      }
      return url;
    }

    if (url.includes("docs.google.com")) {
      if (url.includes("/d/")) {
        const matches = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (matches && matches[1]) {
          const typeMatch = url.match(/(document|spreadsheets|presentation)/);
          const docType = typeMatch ? typeMatch[1] : "document";
          return `https://docs.google.com/${docType}/d/${matches[1]}/preview`;
        }
      }
    }

    return url;
  };

  const handleDownload = () => {
    const pdfUrl = targetPolicy.pdfUrl || (targetPolicy as any).file_link;
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    } else {
      alert("No download file link available for this policy.");
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const categoryName =
    typeof targetPolicy.category === "object" && targetPolicy.category !== null
      ? targetPolicy.category.name
      : String(targetPolicy.category || "General");

  const pdfLink = targetPolicy.pdfUrl || (targetPolicy as any).file_link;
  const docRef =
    (targetPolicy as any).documentRef ||
    (targetPolicy._id
      ? `DOC-${targetPolicy._id.toString().substring(18).toUpperCase()}`
      : "ACAD-REG");

  const formattedUpdateDate = targetPolicy.updatedAt
    ? new Date(targetPolicy.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="bg-[#FAF9F6] min-h-screen font-sans antialiased text-[#0d0e12] pb-24">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E6E2D8] px-4 sm:px-8 md:px-12 py-4">
        <div className="max-w-310 mx-auto flex items-center justify-between">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-[14px] font-bold text-[#0d0e12] hover:opacity-75 transition-opacity cursor-pointer border-0 bg-transparent"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Directory
            </button>
          ) : (
            <Link
              href="/"
              className="flex items-center gap-2 text-[14px] font-bold text-[#0d0e12] hover:opacity-75 transition-opacity"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          )}

          {/* Breadcrumbs */}
          <nav className="hidden sm:flex items-center gap-1.5 text-[13px] text-gray-500 font-medium">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Policies</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#0d0e12] font-semibold truncate max-w-50">
              {targetPolicy.title || "Policy Details"}
            </span>
          </nav>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 border-[#E6E2D8] hover:bg-gray-50 text-[13px] font-semibold text-gray-700 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-600" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-gray-500" />
                <span>Share Policy</span>
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-310 mx-auto px-4 sm:px-8 md:px-12 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Details Panel (Left Column) */}
          <main className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-[#E6E2D8]/70 rounded-[16px] p-6 sm:p-10 shadow-xs">
              {/* Badges & Status */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Badge variant="academic" className="px-3 py-1 text-[13px] font-semibold">
                    {categoryName}
                  </Badge>
                  <span className="inline-flex items-center gap-1.5 bg-[#E6F4EA] text-[#137333] px-3.5 py-1 rounded-full text-[12.5px] font-bold border border-[#CEEAD6]">
                    <span className="w-2 h-2 rounded-full bg-[#137333] animate-pulse" />
                    Active Policy
                  </span>
                  <Badge
                    variant="outline"
                    className="font-mono text-[12px] border-gray-300 bg-gray-50 text-gray-700 font-semibold px-3 py-1"
                  >
                    Ref: {docRef}
                  </Badge>
                </div>
              </div>

              {/* Policy Title */}
              <h1 className="text-2xl sm:text-3xl md:text-[36px] font-extrabold text-[#0d0e12] leading-[1.15] tracking-tight mb-6">
                {targetPolicy.title}
              </h1>

              {/* Dates & Info Bar */}
              <div className="flex flex-wrap gap-x-6 gap-y-3 py-3 px-4 bg-[#FAF9F6] border border-[#E6E2D8]/70 rounded-[10px] text-[13.5px] text-gray-600 font-medium mb-8">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>
                    Effective Date:{" "}
                    <strong className="text-black font-semibold">
                      {(targetPolicy as any).date || "August 1, 2024"}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>
                    Last Updated:{" "}
                    <strong className="text-black font-semibold">
                      {formattedUpdateDate}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Summary Description block */}
              <div className="space-y-3 mb-8">
                <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                  Description & Summary
                </h3>
                <div className="bg-[#FAF9F6] border border-[#E6E2D8]/70 rounded-[12px] p-5">
                  <p className="text-[15px] sm:text-[15.5px] text-[#333] leading-relaxed whitespace-pre-line">
                    {targetPolicy.description || "No description available for this policy."}
                  </p>
                </div>
              </div>

              {/* Full Content Block if present */}
              {targetPolicy.fullContent && (
                <div className="space-y-3 mb-8">
                  <h3 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                    Full Content & Clauses
                  </h3>
                  <div className="bg-white border border-[#E6E2D8] rounded-[12px] p-6 text-[14.5px] text-gray-800 leading-relaxed whitespace-pre-line">
                    {targetPolicy.fullContent}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 items-center pt-2 border-t border-gray-100">
                <Button
                  onClick={handleDownload}
                  className="w-full sm:w-auto bg-[#0056cc] hover:bg-[#0047b3] text-white font-bold px-6 py-5 rounded-[8px] text-[14px] shadow-sm flex items-center justify-center gap-2 border-0 cursor-pointer"
                >
                  <Download className="w-4.5 h-4.5" />
                  Download Official PDF
                </Button>

                {pdfLink && (
                  <a
                    href={pdfLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 border border-[#E6E2D8] hover:bg-gray-50 text-gray-700 font-semibold px-6 py-2.5 rounded-[8px] text-[13.5px] transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Source Link
                  </a>
                )}
              </div>
            </div>

            {/* Document Preview Box */}
            <div className="bg-white border border-[#E6E2D8]/70 rounded-[16px] p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#0056cc]" />
                  <h3 className="font-extrabold text-[17px] text-[#0d0e12]">
                    Document Live Viewer
                  </h3>
                </div>
                {pdfLink && (
                  <Badge variant="secondary" className="text-[12px] text-gray-500 font-normal">
                    Interactive PDF Preview
                  </Badge>
                )}
              </div>

              {pdfLink ? (
                <div className="border border-[#E6E2D8] rounded-[12px] overflow-hidden bg-gray-100 h-162.5 shadow-2xs relative">
                  <iframe
                    src={getPreviewUrl(pdfLink)}
                    className="w-full h-full border-0 absolute inset-0"
                    allow="autoplay"
                    title="Document Live Preview"
                  />
                </div>
              ) : (
                <div className="border border-dashed border-[#E6E2D8] rounded-[12px] p-10 text-center text-gray-500 flex flex-col items-center justify-center gap-3 bg-[#FAF9F6]">
                  <Info className="w-10 h-10 text-gray-400" />
                  <p className="text-[15px] font-semibold text-gray-700">
                    No Document Link Attached
                  </p>
                  <p className="text-[13.5px] text-gray-500 max-w-sm">
                    This policy entry does not currently have an embedded PDF or web document link configured.
                  </p>
                </div>
              )}
            </div>
          </main>

          {/* Sidebar Panel (Right Column) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Policy Info Meta Box */}
            <div className="bg-white border border-[#E6E2D8]/70 rounded-[16px] p-6 shadow-xs space-y-4">
              <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Policy Metadata
              </h5>

              <div className="space-y-3.5 divide-y divide-gray-100 text-[13.5px]">
                <div className="pt-1 flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-500 block text-[12px]">Category</span>
                    <span className="font-bold text-[#0d0e12]">{categoryName}</span>
                  </div>
                </div>

                <div className="pt-3.5 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-500 block text-[12px]">Status</span>
                    <span className="font-bold text-green-700">Officially Ratified</span>
                  </div>
                </div>

                <div className="pt-3.5 flex items-start gap-3">
                  <UserCheck className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-gray-500 block text-[12px]">Target Audience</span>
                    <span className="font-semibold text-gray-800">
                      {(targetPolicy as any).audience || "Students & Academic Faculty"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Policy Contact Box */}
            <div className="bg-white border border-[#E6E2D8]/70 rounded-[16px] p-6 shadow-xs">
              <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Policy Contact & Help
              </h5>
              <h4 className="text-[15.5px] font-bold text-[#0d0e12]">
                Office of Academic Integrity
              </h4>
              <p className="text-[13px] text-gray-500 mt-1 leading-relaxed">
                For questions regarding enforcement, clarification of clauses, or grievance appeals.
              </p>
              <a
                href="mailto:integrity@university.edu"
                className="text-[14px] text-blue-600 font-semibold hover:underline block mt-3"
              >
                integrity@university.edu
              </a>

              <hr className="my-4 border-gray-100" />

              <a
                href="mailto:dean.academic@university.edu?subject=Academic%20Policy%20Query"
                className="inline-flex w-full items-center justify-center gap-2 bg-[#F4F2EC] hover:bg-[#EAE7DF] text-[#0d0e12] border border-[#E6E2D8] rounded-[8px] py-2.5 text-[13.5px] font-bold transition-colors"
              >
                <Mail className="w-4 h-4 text-gray-600" />
                Contact Academic Dean
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

