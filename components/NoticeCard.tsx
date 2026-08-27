"use client";

import React from "react";
import { Megaphone, BookOpen, Info, ChevronRight } from "lucide-react";
import { IPolicy } from "@/types/policy";

interface NoticeCardProps {
  policy: IPolicy;
  tagType?: "Important" | "Notice" | "Info";
  department?: string;
  onSelect: (policy: IPolicy) => void;
}

export const NoticeCard: React.FC<NoticeCardProps> = ({
  policy,
  tagType = "Notice",
  department = "Administration",
  onSelect,
}) => {
  const categoryName =
    typeof policy.category === "object" && policy.category !== null
      ? policy.category.name
      : String(policy.category || "General");

  // Determine tag visual style based on category name or tagType
  let resolvedTag = tagType;
  if (
    categoryName.toLowerCase().includes("exam") ||
    categoryName.toLowerCase().includes("urgent") ||
    categoryName.toLowerCase().includes("academic")
  ) {
    resolvedTag = "Important";
  } else if (
    categoryName.toLowerCase().includes("info") ||
    categoryName.toLowerCase().includes("campus")
  ) {
    resolvedTag = "Info";
  }

  const iconMap = {
    Important: <Megaphone className="w-5 h-5 text-rose-500" />,
    Notice: <BookOpen className="w-5 h-5 text-amber-600" />,
    Info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const bgIconMap = {
    Important: "bg-rose-50 border border-rose-100/60",
    Notice: "bg-amber-50/80 border border-amber-100/60",
    Info: "bg-blue-50/80 border border-blue-100/60",
  };

  const pillMap = {
    Important: "bg-rose-100/70 text-rose-600 border border-rose-200/50",
    Notice: "bg-amber-100/70 text-amber-700 border border-amber-200/50",
    Info: "bg-blue-100/70 text-blue-600 border border-blue-200/50",
  };

  const formattedDate = policy.updatedAt
    ? new Date(policy.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Aug 24, 2026";

  return (
    <div
      onClick={() => onSelect(policy)}
      className="w-full bg-white hover:bg-slate-50/80 rounded-[18px] p-3.5 sm:p-4 transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group"
    >
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        {/* Left Icon Capsule */}
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 ${bgIconMap[resolvedTag]}`}
        >
          {iconMap[resolvedTag]}
        </div>

        {/* Content Details */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight ${pillMap[resolvedTag]}`}
            >
              {resolvedTag}
            </span>
          </div>

          <h4 className="text-base sm:text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight mt-1 truncate">
            {policy.title}
          </h4>

          <p className="text-xs text-slate-500 font-medium line-clamp-1 mt-0.5">
            {policy.description}
          </p>

          <p className="text-[12px] text-slate-400 font-semibold mt-1.5 flex items-center gap-1.5">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{department}</span>
          </p>
        </div>
      </div>

      {/* Far Right Arrow Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(policy);
        }}
        className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-all shrink-0 ml-1 cursor-pointer"
        title="View details"
      >
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};

