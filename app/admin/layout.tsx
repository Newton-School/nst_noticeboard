import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    redirect("/signin");
  }

  return (
    <div className="bg-[#F5F0E6] min-h-screen p-3 sm:p-4 font-sans antialiased text-[#0d0e12] flex flex-col">
      <div className="w-full max-w-[1480px] mx-auto bg-white rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-xl border border-[#E6E2D8]/80 flex flex-col md:flex-row min-h-[calc(100vh-2rem)]">
        {/* Admin Sidebar */}
        <AdminSidebar userEmail={session.user?.email} />

        {/* Main Content Area */}
        <div className="flex-1 bg-[#FAF9F6] p-4 sm:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
