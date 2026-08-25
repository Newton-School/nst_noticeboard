"use client";

import { HeroSection } from "@/components/HeroSection";
import { Navbar } from "@/components/Navbar";
import { PolicyCard } from "@/components/PolicyCard";
import { PolicyDetailModal } from "@/components/PolicyDetailModal";
import { ICategory } from "@/types/category";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { IPolicy } from "@/types/policy";
import { EmptyState } from "./EmptyState";
import { Calendar, Clock } from "lucide-react";

interface UserProfile {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
}

function Home({
  categories = [],
  policies = [],
  user,
}: {
  categories: ICategory[];
  policies: IPolicy[];
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

  return (
    <div className="bg-[#F5F0E6] min-h-screen p-3 sm:p-4 font-sans antialiased text-[#0d0e12] relative overflow-x-hidden selection:bg-blue-500 selection:text-white">
      
      {/* INNER FRAMED CANVAS CONTAINER */}
      <div className="w-full max-w-[1480px] mx-auto bg-[#F5F0E6] rounded-[24px] sm:rounded-[28px] overflow-hidden relative min-h-[calc(100vh-2rem)] flex flex-col justify-between">
        
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

              <div className="bg-white px-4 sm:px-8 lg:px-12 py-6">
                {/* DIRECTORY SECTION */}
                <section id="directory" className="mt-6 mb-20">
                  <div className="lg:col-span-9">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                      <div>
                        <h3 className="text-[24px] font-bold text-[#0d0e12] tracking-tight">
                          Recently Updated Policies
                        </h3>
                        <p className="text-[13.5px] text-gray-500">
                          Official regulatory documentation and academic policy records
                        </p>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <Badge
                          variant="secondary"
                          className="px-3.5 py-1.5 text-[13px] font-normal text-gray-700 bg-slate-100 border border-slate-200"
                        >
                          Showing{" "}
                          <span className="font-bold text-black mx-1">
                            {filteredPolicies.length}
                          </span>{" "}
                          of {policies.length} policies
                        </Badge>
                      </div>
                    </div>

                    {/* Policy Cards List or Empty State */}
                    {policies.length === 0 ? (
                      <EmptyState isDatabaseEmpty={true} />
                    ) : filteredPolicies.length > 0 ? (
                      <div className="space-y-4">
                        {filteredPolicies.map((policy, index) => (
                          <PolicyCard
                            key={String(policy._id || index)}
                            policy={policy}
                            onSelect={(p) => router.push(`/policy?id=${p._id}`)}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        isDatabaseEmpty={false}
                        onResetFilters={handleResetFilters}
                      />
                    )}
                  </div>
                </section>
              </div>
            </>
          )}

          {/* TAB 2: EVENTS VIEW */}
          {activeTab === "events" && (
            <div className="bg-white px-4 sm:px-8 lg:px-12 py-8 min-h-screen">
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Calendar className="w-7 h-7 text-blue-600" />
                  Upcoming Events & Schedule
                </h2>
                <p className="text-slate-500 text-sm mt-1 font-medium">
                  Official events and academic calendar
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
                <Calendar className="w-12 h-12 text-slate-400 mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Events Scheduled</h3>
                <p className="text-sm text-slate-500 max-w-sm mt-1">
                  New campus events and exam schedules will appear here once published.
                </p>
              </div>
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
      </div>

      <PolicyDetailModal
        policy={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
      />
    </div>
  );
}

export default Home;
