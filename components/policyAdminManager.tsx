"use client";

import { useState } from "react";
import { addPolicy } from "@/app/actions/AddPolicy";
import { updatePolicy } from "@/app/actions/UpdatePolicy";
import { addCategory } from "@/app/actions/AddCategory";
import PolicyTable from "@/components/policyTable";
import { IPolicy } from "@/types/policy";
import { ICategory } from "@/types/category";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HexColorPicker } from "react-colorful";
import { IconPicker } from "@/components/ui/icon-picker";
import { PlusCircle, Save, XCircle, FileText, Plus, Layers, X, Loader2 } from "lucide-react";

interface CategoryOption {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface PolicyAdminManagerProps {
  categories: CategoryOption[];
  initialPolicies: IPolicy[];
}

export default function PolicyAdminManager({
  categories: initialCategories,
  initialPolicies,
}: PolicyAdminManagerProps) {
  const [editingPolicy, setEditingPolicy] = useState<IPolicy | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>(initialCategories);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [isAddingCategory, setIsAddingCategory] = useState<boolean>(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // Icon & Color State for Add Category Modal
  const [categoryIcon, setCategoryIcon] = useState<string>("FileText");
  const [categoryColor, setCategoryColor] = useState<string>("#3B82F6");

  const handleOpenCreateModal = () => {
    setEditingPolicy(null);
    setSelectedCategoryId("");
    setShowPolicyModal(true);
  };

  const handleEdit = (policy: IPolicy) => {
    setEditingPolicy(policy);
    setSelectedCategoryId(getCategoryId(policy.category));
    setShowPolicyModal(true);
  };

  const handleCancelEdit = () => {
    setEditingPolicy(null);
    setSelectedCategoryId("");
    setShowPolicyModal(false);
  };

  const getCategoryId = (category: ICategory): string => {
    if (!category) return "";
    if (typeof category === "string") return category;
    if (typeof category === "object" && category?._id) return category._id.toString();
    return "";
  };

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAddingCategory(true);
    setCategoryError(null);

    const formData = new FormData(e.currentTarget);
    const res = await addCategory(formData);

    setIsAddingCategory(false);

    if (res?.error) {
      setCategoryError(res.error);
    } else if (res?.success && res.category) {
      const newCat: CategoryOption = {
        _id: res.category._id,
        name: res.category.name,
        description: res.category.description,
        icon: res.category.icon,
        color: res.category.color,
      };
      setCategoryOptions((prev) => [...prev, newCat]);
      setSelectedCategoryId(newCat._id);
      setShowCategoryModal(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto relative min-h-[calc(100vh-8rem)]">
      {/* Full Width Policies Table List Card */}
      <Card className="bg-white border border-[#E6E2D8]/70 rounded-[24px] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-[22px] font-black text-[#0d0e12] tracking-tight">
              Policies Directory ({initialPolicies.length})
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              View, edit, and delete official institutional guidelines.
            </p>
          </div>
        </div>

        <PolicyTable
          isAdmin={true}
          policies={initialPolicies}
          onEdit={handleEdit}
        />
      </Card>

      {/* Floating Action Button (FAB) on Bottom Right */}
      <div className="fixed bottom-8 right-8 z-50 group">
        <button
          onClick={handleOpenCreateModal}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer relative"
          title="Create New Policy"
        >
          <Plus className="w-7 h-7 transition-transform duration-300 group-hover:rotate-90" />
        </button>
        <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
          Create New Policy
        </span>
      </div>

      {/* IN-PAGE POLICY FORM MODAL DIALOG */}
      {showPolicyModal && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-[#E6E2D8] space-y-5 animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0d0e12]">
                    {editingPolicy ? "Edit Policy" : "Create New Policy"}
                  </h3>
                  <p className="text-xs font-medium text-slate-400">
                    {editingPolicy ? "Update policy details and content" : "Add official policy to the institutional portal"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Policy Form */}
            <form
              action={async (formData: FormData) => {
                const pdfFile = formData.get("pdfFile") as File | null;
                if (pdfFile && pdfFile.size > 10 * 1024 * 1024) {
                  alert("File size exceeds the 10MB limit.");
                  return;
                }
                if (editingPolicy) {
                  await updatePolicy(formData);
                } else {
                  await addPolicy(formData);
                }
                setShowPolicyModal(false);
                setEditingPolicy(null);
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

              {/* PDF File Upload */}
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Upload Policy PDF File
                </label>
                <input
                  type="file"
                  name="pdfFile"
                  accept=".pdf"
                  className="w-full bg-white border border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-[8px] px-3.5 py-2 text-[14px] text-black outline-none transition-all file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-[13px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex items-center gap-2 py-1">
                <div className="flex-grow border-t border-gray-200" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Or</span>
                <div className="flex-grow border-t border-gray-200" />
              </div>

              {/* PDF URL Field */}
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                  Policy PDF URL (Google Drive / Web Link)
                </label>
                <input
                  name="pdfUrl"
                  placeholder="e.g. https://drive.google.com/file/d/.../preview"
                  defaultValue={editingPolicy?.pdfUrl || ""}
                  className="w-full bg-white border border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-[8px] px-3.5 py-2.5 text-[14px] text-black outline-none transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryError(null);
                      setShowCategoryModal(true);
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Category
                  </button>
                </div>
                <select
                  name="categoryId"
                  required
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-[8px] px-3.5 py-2.5 text-[14px] text-black outline-none transition-all cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((c) => (
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
              <div className="pt-4 flex items-center gap-3">
                <Button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 bg-[#FAF9F6] hover:bg-gray-100 text-[#0d0e12] border border-[#E6E2D8]/70 font-bold py-2.5 rounded-[8px] text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#0056cc] hover:bg-[#0047b3] text-white font-bold py-2.5 rounded-[8px] text-[14px] flex items-center justify-center gap-2 border-0 cursor-pointer transition-colors shadow-sm"
                >
                  {editingPolicy ? (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      Publish Policy
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-PAGE ADD CATEGORY MODAL DIALOG */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#E6E2D8] space-y-5 animate-in fade-in zoom-in-95 duration-150 relative max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0d0e12]">Add New Category</h3>
                  <p className="text-xs font-medium text-slate-400">Configure name, icon, and theme color</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {categoryError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                {categoryError}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleCreateCategory} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Academic Governance"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E6E2D8] bg-[#FAF9F6] text-[#0d0e12] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Brief description of this policy category..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E6E2D8] bg-[#FAF9F6] text-[#0d0e12] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium resize-none"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Category Icon
                </label>
                <input type="hidden" name="icon" value={categoryIcon} />
                <IconPicker
                  value={categoryIcon}
                  onValueChange={setCategoryIcon}
                  searchPlaceholder="Search icons..."
                  className="w-full border-[#E6E2D8] bg-[#FAF9F6] rounded-xl text-xs font-medium"
                />
              </div>

              {/* Color Picker */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Theme Color
                </label>
                <input type="hidden" name="color" value={categoryColor} />
                <div className="flex items-center gap-3 p-3 bg-[#FAF9F6] border border-[#E6E2D8] rounded-xl">
                  <div
                    className="w-8 h-8 rounded-lg border border-white shadow-xs shrink-0"
                    style={{ backgroundColor: categoryColor }}
                  />
                  <div className="flex-1 overflow-hidden">
                    <HexColorPicker color={categoryColor} onChange={setCategoryColor} />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-[#E6E2D8] bg-white hover:bg-slate-100 text-xs font-bold text-[#0d0e12] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingCategory}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isAddingCategory ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Category"
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
