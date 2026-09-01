"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Grid,
  Users,
  UploadCloud,
  ArrowLeft,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";

import { getUserAvatar } from "@/lib/utils";

interface AdminSidebarProps {
  userEmail?: string | null;
}

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Policies", href: "/admin/policy", icon: FileText },
    { label: "Events", href: "/admin/events", icon: Calendar },
    { label: "Time Table", href: "/admin/timetable", icon: Grid },
    { label: "Upload Users", href: "/admin/upload", icon: Users },
  ];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#E6E2D8] text-[#0d0e12]">
        <div className="flex items-center gap-2 font-extrabold text-sm">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>Admin Control Panel</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-xs"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed md:static top-0 left-0 bottom-0 z-50 w-64 bg-white border-r border-[#E6E2D8]/80 flex flex-col justify-between p-5 transition-transform duration-200 shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Badge Header */}
          <div className="flex items-center gap-2.5 pb-6 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0d0e12] leading-tight">Admin Panel</h2>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-950"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer Area */}
        <div className="pt-6 border-t border-slate-100 space-y-3">
          {userEmail && (
            <div className="px-3 py-2 rounded-xl bg-[#FAF9F6] border border-[#E6E2D8] flex items-center gap-2.5">
              <img
                src={getUserAvatar(userEmail)}
                alt="Admin Avatar"
                className="w-8 h-8 rounded-full border border-blue-200 bg-blue-50/50 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Logged in as</p>
                <p className="text-xs font-extrabold text-slate-800 truncate">{userEmail}</p>
              </div>
            </div>
          )}

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full px-3.5 py-2.5 rounded-2xl border border-[#E6E2D8] bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portal</span>
          </Link>
        </div>
      </aside>
    </>
  );
}

