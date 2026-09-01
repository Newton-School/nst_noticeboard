import React from "react";
import { getDb } from "@/lib/db";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Grid,
  Users,
  ArrowRight,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const db = await getDb();
  
  let policiesCount = 0;
  let eventsCount = 0;
  let timetableCount = 0;
  let usersCount = 0;

  try {
    policiesCount = await db.collection("policy").countDocuments({});
    eventsCount = await db.collection("event").countDocuments({});
    timetableCount = await db.collection("timetable").countDocuments({});
    usersCount = await db.collection("user").countDocuments({});
  } catch (err) {
    console.error("Error fetching admin stats:", err);
  }

  const quickLinks = [
    {
      title: "Policies Management",
      description: "Upload, update, or remove institutional rules and policy manuals.",
      href: "/admin/policy",
      count: `${policiesCount} Active Policies`,
      icon: FileText,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      iconBg: "bg-blue-600",
    },
    {
      title: "Events Management",
      description: "Schedule upcoming campus events, hackathons, and announcements.",
      href: "/admin/events",
      count: `${eventsCount} Active Events`,
      icon: Calendar,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconBg: "bg-emerald-600",
    },
    {
      title: "Time Table Schedules",
      description: "Configure batch lecture schedules, lab timings, and room allocations.",
      href: "/admin/timetable",
      count: `${timetableCount} Active Schedules`,
      icon: Grid,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      iconBg: "bg-amber-600",
    },
    {
      title: "Upload Users",
      description: "Batch import student and faculty accounts via Excel / CSV spreadsheets.",
      href: "/admin/upload",
      count: `${usersCount} Registered Users`,
      icon: Users,
      color: "bg-rose-50 text-rose-700 border-rose-200",
      iconBg: "bg-rose-600",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white border border-[#E6E2D8] rounded-[24px] p-6 sm:p-8 shadow-xs">
        <h1 className="text-2xl sm:text-3xl font-black text-[#0d0e12] tracking-tight">
          Admin Dashboard
        </h1>
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h2 className="text-base font-extrabold text-[#0d0e12] mb-4">
          Management Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="bg-white border border-[#E6E2D8] hover:border-blue-300 rounded-[24px] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-2xl ${item.iconBg} text-white flex items-center justify-center font-bold shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${item.color}`}>
                      {item.count}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-[#0d0e12] group-hover:text-blue-600 transition-colors mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-700">
                  <span>View</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
