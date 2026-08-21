"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Navbar: React.FC = () => {
  return (
    <header className="max-w-275 mx-auto bg-[#F4F2EC] rounded-[10px] px-6 py-3 flex items-center justify-between border border-[#E6E2D8]/70 shadow-xs mt-4">
      {/* Logo & Brand Name */}
      <Link href="/" className="flex items-center gap-3 pl-1 no-underline text-inherit hover:opacity-90">
        <div className="w-8 h-8 bg-black rounded-[10px] flex items-center justify-center shrink-0 shadow-xs">
          <GraduationCap className="w-4 h-4 text-white" />
        </div>
        <span className="font-extrabold text-[19px] tracking-tight text-[#0f1115]">
          EduPolicy <span className="font-medium text-[#555]">Portal</span>
        </span>
      </Link>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        <Link href="/admin/policy" passHref legacyBehavior>
          <Button
            variant="outline"
            className="text-[13px] font-bold border-gray-300 bg-white hover:bg-gray-100 hover:text-black cursor-pointer px-4 h-9 shadow-2xs text-[#0f1115] flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4 text-gray-500" />
            Admin Panel
          </Button>
        </Link>

        <Link href="/signout" passHref legacyBehavior>
          <Button
            className="text-[13px] font-bold bg-[#121316] hover:bg-black text-white cursor-pointer px-4 h-9 shadow-2xs border-0 flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </Link>
      </div>
    </header>
  );
};
