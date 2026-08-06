"use client";

import React from "react";
import { Clock, ChevronRight } from "lucide-react";
import { IPolicy } from "@/types/policy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface PolicyCardProps {
  policy: IPolicy;
  onSelect: (policy: IPolicy) => void;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({ policy, onSelect }) => {
  const categoryName =
    typeof policy.category === "object" && policy.category !== null
      ? policy.category.name
      : String(policy.category || "General");

  const displayDate =
    (policy.updatedAt
      ? new Date(policy.updatedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Recently");

  return (
    <Card className="p-6 border-[#E6E2D8] hover:border-gray-400 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-5 group">
      <div className="space-y-2 max-w-2xl">
        {/* High-Contrast Badges Row */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge
            variant={
              categoryName === "Academic"
                ? "academic"
                : categoryName === "Campus"
                ? "campus"
                : categoryName === "Exams"
                ? "exams"
                : categoryName === "Attendance"
                ? "attendance"
                : "secondary"
            }
          >
            {categoryName}
          </Badge>
          <span className="text-[12.5px] text-gray-500 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {displayDate}
          </span>

        </div>

        {/* Policy Title */}
        <h4 className="text-[20px] font-bold text-[#0d0e12] group-hover:text-black transition-colors tracking-tight">
          {policy.title}
        </h4>

        {/* Policy Description */}
        <p className="text-[14px] text-[#505258] leading-relaxed">
          {policy.description}
        </p>
      </div>

      {/* Action Button */}
      <Button
        variant="soft"
        onClick={() => onSelect(policy)}
        className="group-hover:bg-[#121316] group-hover:text-white transition-all shrink-0 self-start md:self-center font-semibold"
      >
        View Details
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </Button>
    </Card>
  );
};
