"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  Home,
  Calendar,
  FileText,
  Grid,
  Bell,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getUserAvatar } from "@/lib/utils";

interface NavbarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  selectedBatch?: string;
  setSelectedBatch?: (batch: string) => void;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = "home",
  setActiveTab = () => {},
  selectedBatch = "All Batches",
  setSelectedBatch = () => {},
  user,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  const avatarUrl = getUserAvatar(user?.email, user?.name, user?.image);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "events", label: "Events", icon: Calendar },
    { id: "policies", label: "Policies", icon: FileText },
    { id: "timetable", label: "Time Table", icon: Grid },
  ];

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4 pointer-events-auto flex justify-center">
      {/* 100% SEAMLESS CONTINUOUS U-SHAPED TAB NAVBAR CONTAINER */}
      <header className="relative bg-[#F5F0E6] rounded-b-[32px] sm:rounded-b-[36px] px-8 sm:px-12 py-3.5 sm:py-4 flex items-center justify-between gap-6 sm:gap-10 transition-all duration-300">
        
        {/* CONCAVE INVERSE CURVE - TOP LEFT */}
        <svg className="absolute -top-px -left-5 w-5 h-5 fill-[#F5F0E6] pointer-events-none" viewBox="0 0 20 20">
          <path d="M0,0 L20,0 L20,20 C20,8.954 11.046,0 0,0 Z" />
        </svg>

        {/* CONCAVE INVERSE CURVE - TOP RIGHT */}
        <svg className="absolute -top-px -right-5 w-5 h-5 fill-[#F5F0E6] pointer-events-none" viewBox="0 0 20 20">
          <path d="M20,0 L0,0 L0,20 C0,8.954 8.954,0 20,0 Z" />
        </svg>

        {/* CENTER: Main Navigation Tabs */}
        <nav className="flex items-center gap-2 sm:gap-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-slate-800 hover:text-slate-950 hover:bg-white/70"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 sm:w-5 sm:h-5 ${isActive ? "text-white" : "text-slate-700"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* RIGHT: Notification Bell & Profile Avatar */}
        <div className="flex items-center gap-3">
          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="p-2 sm:p-2.5 rounded-full hover:bg-white/80 text-slate-800 transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-slate-800" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-[#F5F0E6] animate-pulse" />
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Notifications
                  </span>
                  <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline">
                    Mark as read
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs">
                    <p className="font-bold text-slate-900">Noticeboard active</p>
                    <p className="text-slate-500 mt-0.5">Stay updated with latest college policies and announcements.</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar & Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-1.5 p-0.5 rounded-full hover:bg-white/80 transition-colors cursor-pointer"
            >
              <Avatar className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-blue-200 shadow-2xs bg-blue-50 text-slate-900 overflow-hidden">
                <AvatarImage src={avatarUrl} alt={user?.name || "User Profile Photo"} />
                <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                  {getUserInitials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-slate-700" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2.5 border-b border-slate-100 mb-1 flex items-center gap-3">
                  <img
                    src={avatarUrl}
                    alt="Profile Avatar"
                    className="w-9 h-9 rounded-full border border-blue-200 bg-blue-50/50 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.name || "Student User"}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email || "Student Account"}</p>
                  </div>
                </div>
                {user?.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setShowProfileMenu(false)}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                  >
                    <ShieldAlert className="w-4 h-4 text-blue-600" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    setShowSignOutModal(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>

      </header>


      {/* Sign Out Confirmation Modal Portal */}
      {mounted && showSignOutModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#F5F0E6] rounded-[24px] p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-[#E6E2D8] text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-[#E6E2D8]/80 text-[#0d0e12] flex items-center justify-center mx-auto shadow-2xs">
              <LogOut className="w-5 h-5 text-slate-800" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#0d0e12]">Sign Out Confirmation</h3>
              <p className="text-xs font-medium text-[#555] mt-1">Are you sure you want to sign out of your account?</p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowSignOutModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white hover:bg-gray-100 text-xs font-bold text-[#0d0e12] transition cursor-pointer shadow-2xs"
              >
                Cancel
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/signin" })}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
