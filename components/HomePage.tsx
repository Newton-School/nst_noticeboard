"use client";

import { HeroSection } from "@/components/HeroSection"
import { Navbar } from "@/components/Navbar"
import { PolicyCard } from "@/components/PolicyCard"
import { PolicyDetailModal } from "@/components/PolicyDetailModal"
import { QuickAccessGrid } from "@/components/QuickAccessGrid"
import { ICategory } from "@/types/category"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { IPolicy } from "@/types/policy"
import { EmptyState } from "./EmptyState"
import UFMPolicyClient from "@/app/academic/ufm/UFMPolicyClient"

function Home({categories = [], policies = []} : { categories: ICategory[], policies: IPolicy[]}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState<IPolicy | null>(null);

  if (selectedPolicy) {
    return (
      <UFMPolicyClient
        initialPolicies={policies}
        defaultSelectedPolicy={selectedPolicy}
        onBack={() => setSelectedPolicy(null)}
      />
    );
  }

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
    <div className="bg-white min-h-screen font-sans antialiased text-[#0d0e12] py-6 px-4 sm:px-8 md:px-12 lg:px-16 relative overflow-x-hidden">
      {/* Main Content Wrapper */}
      <div className="max-w-310 mx-auto">
        {/* Modular Navigation Bar */}
        <Navbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Modular Hero Section */}
        <HeroSection searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Modular Quick Access Grid */}
        <QuickAccessGrid
          activeCategoryFilter={activeCategoryFilter}
          setActiveCategoryFilter={setActiveCategoryFilter}
          categories={categories.slice(0, 4)}
        />
        <section id="directory" className="mt-14 mb-20">
          <div className="lg:col-span-9">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                <div>
                  <h3 className="text-[24px] font-bold text-[#0d0e12] tracking-tight">
                    Recently Updated
                  </h3>
                  <p className="text-[13.5px] text-gray-500">
                    Official regulatory documentation and academic policy records
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Badge variant="secondary" className="px-3.5 py-1.5 text-[13px] font-normal text-gray-700 bg-[#F4F2EC]">
                    Showing <span className="font-bold text-black mx-1">{filteredPolicies.length}</span> of {policies.length} policies
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
                      onSelect={(p) => setSelectedPolicy(p)}
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

      <PolicyDetailModal
        policy={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
      />
    </div>
  )
}

export default Home;