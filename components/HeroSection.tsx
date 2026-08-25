"use client";

import React, { useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeroSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userName?: string | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  setSearchQuery,
  userName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract first name or fallback to Student
  const displayName = userName ? userName.trim().split(" ")[0] : "Student";

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = () => {
    const directorySection = document.getElementById("directory");
    directorySection?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePillClick = (tag: string) => {
    setSearchQuery(tag);
    handleSearchSubmit();
  };

  const recommendedPills = [
    { title: "Attendance Policy", query: "Attendance Policy" },
    { title: "Examination Rules", query: "Examination Rules" },
  ];

  return (
    <div className="w-full relative min-h-[calc(100vh-2rem)] bg-[url('/bg_main.png')] bg-cover bg-right-bottom sm:bg-right bg-no-repeat flex flex-col justify-start p-6 sm:p-10 lg:p-14 pl-24 sm:pl-40 lg:pl-56 pt-32 sm:pt-36 lg:pt-40 pb-16 transition-all overflow-hidden">
      
      {/* CENTRAL OPEN SKY CONTENT OVERLAY */}
      <div className="w-full lg:w-8/12 flex flex-col items-start text-left z-10">
        
        {/* DYNAMIC USER GREETING */}
        <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-black tracking-tight text-slate-950 leading-tight">
          Hey {displayName}!
        </h1>

        {/* SUBTITLE */}
        <p className="text-lg sm:text-xl font-bold text-slate-800 mt-3 mb-8 max-w-lg leading-relaxed">
          Find policies, notices and events all in one place.
        </p>

        {/* SEARCH INPUT CAPSULE BAR */}
        <div className="w-full max-w-xl relative flex items-center bg-white/95 backdrop-blur-md p-2.5 rounded-full border border-slate-200/90 shadow-2xl shadow-blue-500/15 group focus-within:border-blue-500/60 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all mb-5">
          <Search className="w-6 h-6 text-slate-400 group-focus-within:text-blue-600 transition-colors ml-4 shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search policies, rules, guidelines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchSubmit();
            }}
            className="bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base md:text-lg h-12 text-slate-900 placeholder:text-slate-400 font-semibold px-4"
          />
          <kbd className="hidden sm:inline-flex items-center px-2.5 py-1.5 text-xs font-mono font-medium text-slate-400 bg-slate-100 rounded-md border border-slate-200 mr-2 shrink-0 select-none">
            ⌘ K
          </kbd>
          <button
            onClick={handleSearchSubmit}
            className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Search"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>

        {/* RECOMMENDED SMALL PILLS */}
        <div className="flex flex-wrap items-center gap-2.5 max-w-xl">
          {recommendedPills.map((pill) => (
            <button
              key={pill.title}
              onClick={() => handlePillClick(pill.query)}
              className="px-4 py-2 rounded-full bg-white/90 hover:bg-white backdrop-blur-md border border-slate-200/90 text-xs sm:text-sm font-extrabold text-slate-900 hover:text-blue-600 hover:border-blue-400 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              {pill.title}
            </button>
          ))}
        </div>

      </div>

    </div>
  );
};
