"use client";

import React from "react";
import { Clock, MapPin, ChevronRight } from "lucide-react";

export interface EventItem {
  id: string;
  month: string;
  day: string;
  title: string;
  tag: string;
  tagColor?: "blue" | "pink" | "amber" | "green";
  time: string;
  location: string;
  policyId?: string;
}

interface EventCardProps {
  event: EventItem;
  onSelect: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect }) => {
  const tagColorMap = {
    blue: "bg-blue-100/80 text-blue-600 border border-blue-200/50",
    pink: "bg-rose-100/80 text-rose-600 border border-rose-200/50",
    amber: "bg-amber-100/80 text-amber-700 border border-amber-200/50",
    green: "bg-emerald-100/80 text-emerald-700 border border-emerald-200/50",
  };

  const selectedTagStyle = tagColorMap[event.tagColor || "blue"];

  return (
    <div
      onClick={() => onSelect(event)}
      className="w-full bg-white hover:bg-slate-50/80 rounded-[18px] p-3.5 sm:p-4 transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer group"
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Left Date Block Capsule */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50/80 border border-blue-100/70 flex flex-col items-center justify-center shrink-0 font-sans">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
            {event.month}
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 leading-none mt-1">
            {event.day}
          </span>
        </div>

        {/* Details Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base sm:text-[16px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight truncate">
              {event.title}
            </h4>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight shrink-0 ${selectedTagStyle}`}
            >
              {event.tag}
            </span>
          </div>

          <div className="flex items-center gap-3.5 text-xs text-slate-500 font-medium mt-1.5 flex-wrap">
            <div className="flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Far Right Arrow Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onSelect(event);
        }}
        className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-all shrink-0 ml-1 cursor-pointer"
        title="View details"
      >
        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};

