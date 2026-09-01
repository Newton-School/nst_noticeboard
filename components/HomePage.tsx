"use client";

import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { NoticeCard } from "@/components/NoticeCard";
import { EventCard, EventItem } from "@/components/EventCard";
import { PolicyDetailModal } from "@/components/PolicyDetailModal";
import { Footer } from "@/components/Footer";
import { ICategory } from "@/types/category";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IPolicy } from "@/types/policy";
import { Clock, Calendar, Megaphone, ChevronRight, BookOpen } from "lucide-react";
import Link from "next/link";


interface UserProfile {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

function Home({
  policies = [],
  events = [],
  user,
}: {
  categories?: ICategory[];
  policies: IPolicy[];
  events?: EventItem[];
  user?: UserProfile | null;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState<IPolicy | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [selectedBatch, setSelectedBatch] = useState("All Batches");

  const filteredPolicies = policies.filter((policy) => {
    const title = policy.title || "";
    const matchesSearch = searchQuery
      ? title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory = activeCategoryFilter
      ? typeof policy.category === "object" && policy.category !== null
        ? policy.category.name === activeCategoryFilter
        : policy.category === activeCategoryFilter
      : true;

    return matchesSearch && matchesCategory;
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setActiveCategoryFilter("");
  };

  // Display top 2-3 real policies if available (no dummy data)
  const displayNotices = filteredPolicies.slice(0, 3).map((policy, idx) => ({
    policy,
    tagType: (idx === 0 ? "Important" : idx === 1 ? "Notice" : "Info") as "Important" | "Notice" | "Info",
    department:
      typeof policy.category === "object" && policy.category?.name
        ? policy.category.name
        : "Administration",
  }));

  const displayEvents = events.slice(0, 3);

  const handleNavigateToPolicy = (policy: IPolicy) => {
    if (policy._id) {
      router.push(`/policy?id=${policy._id}`);
    } else {
      setSelectedPolicy(policy);
    }
  };

  const handleNavigateToEvent = (event: EventItem) => {
    if (event.policyId) {
      router.push(`/policy?id=${event.policyId}`);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="bg-[#F5F0E6] min-h-screen p-3 sm:p-4 font-sans antialiased text-[#0d0e12] relative overflow-x-hidden selection:bg-blue-500 selection:text-white">
      
      {/* INNER FRAMED CANVAS CONTAINER */}
      <div className="w-full max-w-[1480px] mx-auto bg-white rounded-[24px] sm:rounded-[28px] overflow-hidden relative min-h-[calc(100vh-2rem)] flex flex-col justify-between">
        
        {/* DYNAMIC ISLAND NAVBAR FLOATING AT TOP CENTER */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedBatch={selectedBatch}
          setSelectedBatch={setSelectedBatch}
          user={user}
        />

        {/* MAIN BODY WRAPPER INSIDE CANVAS */}
        <div className="flex-1 w-full">
          
          {/* TAB 1: HOME VIEW */}
          {(activeTab === "home" || activeTab === "policies") && (
            <>
              {/* Modular Hero Section - Stretches Full Edge to Edge */}
              <HeroSection
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                userName={user?.name}
              />

              {/* SIDE-BY-SIDE FEED SECTION WITH TREE OVERLAP ON CARDS */}
              <div id="directory" className="relative z-10 bg-transparent px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8 pb-4 transition-all">
                <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
                  
                  {/* LEFT CONTAINER CARD: IMPORTANT NOTICES */}
                  <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-100/90 shadow-md flex flex-col justify-between h-full relative z-10">
                    
                    {/* HEADER ROW */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100/80 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Megaphone className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                          Important Notices
                        </h3>
                      </div>
                      <Link
                        href="/policies"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
                      >
                        View all
                        <ChevronRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>

                    {/* NOTICES LIST OR EMPTY STATE */}
                    {displayNotices.length > 0 ? (
                      <div className="space-y-2 divide-y divide-slate-100/80 flex-1">
                        {displayNotices.map((item, idx) => (
                          <div key={String(item.policy._id || idx)} className={idx > 0 ? "pt-2" : ""}>
                            <NoticeCard
                              policy={item.policy}
                              tagType={item.tagType}
                              department={item.department}
                              onSelect={handleNavigateToPolicy}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="my-auto py-8 px-4 text-center flex flex-col items-center justify-center flex-1">
                        <BookOpen className="w-10 h-10 text-slate-300 mb-2" />
                        <h4 className="text-base font-bold text-slate-800">
                          {searchQuery || activeCategoryFilter ? "No Matching Notices" : "No Important Notices"}
                        </h4>
                        <p className="text-xs text-slate-500 max-w-sm mt-1 font-medium">
                          {searchQuery || activeCategoryFilter
                            ? "No notices matched your active search filters."
                            : "There are currently no notices or policies published."}
                        </p>
                        {(searchQuery || activeCategoryFilter) && (
                          <button
                            onClick={handleResetFilters}
                            className="mt-3 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                          >
                            Clear search filters
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* RIGHT CONTAINER CARD: UPCOMING EVENTS */}
                  <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-100/90 shadow-md flex flex-col justify-between h-full relative z-10">
                    
                    {/* HEADER ROW */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100/80 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                          Upcoming Events
                        </h3>
                      </div>
                      <Link
                        href="/events"
                        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors group"
                      >
                        View all
                        <ChevronRight className="w-4 h-4 text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>


                    {/* EVENTS LIST OR EMPTY STATE */}
                    {displayEvents.length > 0 ? (
                      <div className="space-y-2 divide-y divide-slate-100/80 flex-1">
                        {displayEvents.map((event, idx) => (
                          <div key={event.id} className={idx > 0 ? "pt-2" : ""}>
                            <EventCard
                              event={event}
                              onSelect={handleNavigateToEvent}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="my-auto py-8 px-4 text-center flex flex-col items-center justify-center flex-1">
                        <Calendar className="w-10 h-10 text-slate-300 mb-2" />
                        <h4 className="text-base font-bold text-slate-800">No Upcoming Events</h4>
                        <p className="text-xs text-slate-500 max-w-sm mt-1 font-medium">
                          New campus events and schedules will appear here once published.
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              </div>



            </>
          )}

          {/* TAB 2: EVENTS VIEW */}
          {activeTab === "events" && (
            <div className="bg-white px-4 sm:px-8 lg:px-12 py-8 min-h-screen">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Calendar className="w-7 h-7 text-blue-600" />
                    Upcoming Events & Schedule
                  </h2>
                  <p className="text-slate-500 text-sm mt-1 font-medium">
                    Official events and academic calendar
                  </p>
                </div>
              </div>

              {displayEvents.length > 0 ? (
                <div className="max-w-4xl mx-auto space-y-4">
                  {displayEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onSelect={handleNavigateToEvent}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center max-w-2xl mx-auto">
                  <Calendar className="w-12 h-12 text-slate-400 mb-3" />
                  <h3 className="text-lg font-bold text-slate-800">No Events Scheduled</h3>
                  <p className="text-sm text-slate-500 max-w-sm mt-1">
                    New campus events and exam schedules will appear here once published.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TIMETABLE VIEW */}
          {activeTab === "timetable" && (
            <div className="bg-white px-4 sm:px-8 lg:px-12 py-8 min-h-screen">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Clock className="w-7 h-7 text-blue-600" />
                  Class Schedule & Timetable
                </h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">
                  Room allocations and timetable schedule
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
                <Clock className="w-12 h-12 text-slate-400 mb-3" />
                <h3 className="text-lg font-bold text-slate-800">Timetable Unavailable</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-1">
                  Class schedules will be automatically updated at the start of the session.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Landscape Banner */}
        <Footer />
      </div>

      <PolicyDetailModal
        policy={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
      />
    </div>
  );
}

export default Home;



