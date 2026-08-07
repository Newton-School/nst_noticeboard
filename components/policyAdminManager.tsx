"use client";

import { useState } from "react";
import { addPolicy } from "@/app/actions/AddPolicy";
import { updatePolicy } from "@/app/actions/UpdatePolicy";
import PolicyTable from "@/components/policyTable";
import { IPolicy } from "@/types/policy";
import { ICategory } from "@/types/category";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, XCircle, FileText } from "lucide-react";

interface CategoryOption {
  _id: string;
  name: string;
}

interface PolicyAdminManagerProps {
  categories: CategoryOption[];
  initialPolicies: IPolicy[];
}

export default function PolicyAdminManager({
  categories,
  initialPolicies,
}: PolicyAdminManagerProps) {
  const [editingPolicy, setEditingPolicy] = useState<IPolicy | null>(null);

  const handleEdit = (policy: IPolicy) => {
    setEditingPolicy(policy);
  };

  const handleCancelEdit = () => {
    setEditingPolicy(null);
  };

  const getCategoryId = (category: ICategory): string => {
    if (!category) return "";
    if (typeof category === "string") return category;
    if (typeof category === "object" && category?._id) return category._id.toString();
    return "";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form Card */}
      <Card className="lg:col-span-5 bg-white border border-[#E6E2D8]/70 rounded-[16px] p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-gray-500" />
          <h2 className="text-[20px] font-extrabold text-[#0d0e12]">
            {editingPolicy ? "Edit Policy" : "Create New Policy"}
          </h2>
        </div>

        <form
          action={async (formData: FormData) => {
            if (editingPolicy) {
              await updatePolicy(formData);
              setEditingPolicy(null);
            } else {
              await addPolicy(formData);
            }
          }}
          key={editingPolicy ? editingPolicy._id?.toString() : "create"}
          className="space-y-4"
        >
          {editingPolicy && (
            <input
              type="hidden"
              name="_id"
              value={editingPolicy._id?.toString()}
            />
          )}

          {/* Policy Title Field */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Policy Title
            </label>
            <input
              name="title"
              placeholder="e.g. Unfair Means (UFM) Policy 2024"
              required
              defaultValue={editingPolicy?.title || ""}
              className="w-full bg-white border border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-[8px] px-3.5 py-2.5 text-[14px] text-black outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* PDF URL Field */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Policy PDF URL (Google Drive / S3 / Web Link)
            </label>
            <input
              name="pdfUrl"
              placeholder="e.g. https://drive.google.com/file/d/.../preview"
              required
              defaultValue={editingPolicy?.pdfUrl || ""}
              className="w-full bg-white border border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-[8px] px-3.5 py-2.5 text-[14px] text-black outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Category
            </label>
            <select
              name="categoryId"
              required
              defaultValue={editingPolicy ? getCategoryId(editingPolicy.category) : ""}
              className="w-full bg-white border border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-[8px] px-3.5 py-2.5 text-[14px] text-black outline-none transition-all"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Brief Description
            </label>
            <textarea
              name="description"
              placeholder="Provide a brief summary of the policy objectives..."
              required
              defaultValue={editingPolicy?.description || ""}
              rows={3}
              className="w-full bg-white border border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-[8px] px-3.5 py-2.5 text-[14px] text-black outline-none transition-all placeholder:text-gray-400 resize-y min-h-20"
            />
          </div>

          {/* Full Content Textarea */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Full Content / Regulatory Framework
            </label>
            <textarea
              name="fullContent"
              placeholder="Enter full regulatory clauses and legal framework details..."
              required
              defaultValue={editingPolicy?.fullContent || ""}
              rows={5}
              className="w-full bg-white border border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-[8px] px-3.5 py-2.5 text-[14px] text-black outline-none transition-all placeholder:text-gray-400 resize-y min-h-30"
            />
          </div>

          {/* Actions Button Panel */}
          <div className="pt-4 space-y-2">
            <Button
              type="submit"
              className="w-full bg-[#0056cc] hover:bg-[#0047b3] text-white font-bold py-2.5 rounded-[8px] text-[14px] flex items-center justify-center gap-2 border-0 cursor-pointer transition-colors"
            >
              {editingPolicy ? (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Add Policy
                </>
              )}
            </Button>
            
            {editingPolicy && (
              <Button
                type="button"
                onClick={handleCancelEdit}
                className="w-full bg-[#FAF9F6] hover:bg-gray-100 text-[#0d0e12] border border-[#E6E2D8]/70 font-bold py-2.5 rounded-[8px] text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <XCircle className="w-4 h-4 text-gray-500" />
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </Card>

      {/* Right Column: Policies Table List Card */}
      <Card className="lg:col-span-7 bg-white border border-[#E6E2D8]/70 rounded-[16px] p-6 shadow-xs">
        <h2 className="text-[20px] font-extrabold text-[#0d0e12] mb-6">
          Policies Directory ({initialPolicies.length})
        </h2>
        <PolicyTable
          isAdmin={true}
          policies={initialPolicies}
          onEdit={handleEdit}
        />
      </Card>
    </div>
  );
}
