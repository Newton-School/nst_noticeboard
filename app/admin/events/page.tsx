import React from "react";
import Link from "next/link";
import { Plus, ArrowLeft } from "lucide-react";

export default function AdminEventsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto relative min-h-[calc(100vh-8rem)]">
      {/* Header Card */}
      <div className="bg-white border border-[#E6E2D8] rounded-[24px] p-6 sm:p-8 shadow-xs">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-gray-500 hover:text-black transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <h1 className="text-2xl font-black text-[#0d0e12]">Events Management</h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Create, publish, and update campus events and notices.
        </p>
      </div>

      {/* Floating Action Button (FAB) on Bottom Right */}
      <div className="fixed bottom-8 right-8 z-50 group">
        <button
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer relative"
          title="Create Event"
        >
          <Plus className="w-7 h-7 transition-transform duration-300 group-hover:rotate-90" />
        </button>
        <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
          Create Event
        </span>
      </div>
    </div>
  );
}
