import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { auth } from "@/auth";
import { Calendar } from "lucide-react";

export default async function EventsPage() {
  const session = await auth();

  return (
    <div className="bg-[#F5F0E6] min-h-screen p-3 sm:p-4 font-sans antialiased text-[#0d0e12] relative overflow-x-hidden">
      {/* INNER FRAMED CANVAS CONTAINER */}
      <div className="w-full max-w-[1480px] mx-auto bg-white rounded-[24px] sm:rounded-[28px] overflow-hidden relative min-h-[calc(100vh-2rem)] flex flex-col justify-between">
        <div>
          {/* Navbar Container */}
          <div className="relative pt-6 pb-20">
            <Navbar activeTab="events" user={session?.user} />
          </div>

          {/* Main Content Area */}
          <main className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mt-4 w-full flex-1">
            {/* Empty State */}
            <div className="bg-[#FAF9F6] border border-[#E6E2D8]/80 rounded-[24px] p-12 text-center space-y-3 shadow-xs">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-800">No Events Scheduled Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upcoming campus events, hackathons, and workshops will appear here once scheduled.
              </p>
            </div>
          </main>
        </div>

        {/* Footer Landscape Banner */}
        <Footer />
      </div>
    </div>
  );
}
