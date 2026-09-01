"use client";

import React, { useState, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { LucideProps } from "lucide-react";

// Curated list of popular, practical category icons for fast performance & clean UX
export const POPULAR_CATEGORY_ICONS = [
  "ShoppingBag", "Folder", "Tag", "Bookmark", "Star", "Heart", "Bell",
  "Briefcase", "Calendar", "Camera", "FileText", "Grid", "Home", "Image",
  "Info", "Layers", "Layout", "Link", "List", "Mail", "MapPin", "MessageSquare",
  "Package", "Paperclip", "Percent", "Phone", "Pin", "Send", "Settings",
  "Share2", "Shield", "ShoppingCart", "Smartphone", "Smile", "Sliders",
  "Terminal", "User", "Users", "Video", "Zap", "Award", "Box", "Clock",
  "Compass", "CreditCard", "Database", "Edit", "Globe", "HelpCircle", "Key",
  "Lock", "Music", "Printer", "Search", "Server", "Tool", "Trash2", "Tv"
] as const;

export type IconName = typeof POPULAR_CATEGORY_ICONS[number] | string;

interface IconPickerProps {
  value?: string;
  onValueChange?: (value: string) => void;
  searchPlaceholder?: string;
  triggerPlaceholder?: string;
  className?: string;
}

// Renders dynamic Lucide icon directly from static module map
export const IconHelper = ({ name, ...props }: { name: string } & LucideProps) => {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<LucideProps>>)[name] || Icons.HelpCircle;
  return <IconComponent {...props} />;
};

export function IconPicker({
  value,
  onValueChange,
  searchPlaceholder = "Search category icons...",
  triggerPlaceholder = "Select an icon",
  className,
}: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return POPULAR_CATEGORY_ICONS;
    const term = search.toLowerCase();
    return POPULAR_CATEGORY_ICONS.filter((icon) => icon.toLowerCase().includes(term));
  }, [search]);

  const handleSelect = (iconName: string) => {
    onValueChange?.(iconName);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn("w-full justify-between gap-2 font-medium cursor-pointer", className)}
        >
          <div className="flex items-center gap-2 truncate">
            {value ? (
              <>
                <IconHelper name={value} className="h-4 w-4 text-blue-600 shrink-0" />
                <span className="font-bold text-slate-800">{value}</span>
              </>
            ) : (
              <span className="text-slate-400 font-medium">{triggerPlaceholder}</span>
            )}
          </div>
          <Icons.ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 z-[10000] bg-white border border-[#E6E2D8] shadow-2xl rounded-2xl" align="start">
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3 h-9 text-xs rounded-xl border-[#E6E2D8] bg-[#FAF9F6]"
        />
        <div className="grid grid-cols-6 gap-1.5 max-h-52 overflow-y-auto pr-1">
          {filteredIcons.map((iconName) => {
            const isSelected = value === iconName;
            return (
              <button
                key={iconName}
                type="button"
                title={iconName}
                onClick={() => handleSelect(iconName)}
                className={cn(
                  "flex items-center justify-center h-9 w-9 rounded-xl border text-sm transition-all cursor-pointer",
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700"
                )}
              >
                <IconHelper name={iconName} className="h-4.5 w-4.5" />
              </button>
            );
          })}
          {filteredIcons.length === 0 && (
            <div className="col-span-6 py-4 text-center text-xs text-slate-400 font-medium">
              No matching icons found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}