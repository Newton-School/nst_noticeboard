"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { uploadUsersFromExcel } from "../../actions/UploadUsers";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileSpreadsheet,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  Info
} from "lucide-react";

export default function AdminUploadPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size helper
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setStatus(null);
      setErrorStatus(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (["xlsx", "xls", "csv"].includes(ext || "")) {
        setSelectedFile(file);
        setStatus(null);
        setErrorStatus(null);
      } else {
        setErrorStatus("Invalid file format. Please upload an Excel (.xlsx, .xls) or CSV file.");
      }
    }
  };

  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setStatus(null);
    setErrorStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleTriggerInput = () => {
    fileInputRef.current?.click();
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setStatus(null);
    setErrorStatus(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const result = await uploadUsersFromExcel(formData);
      if (result.success) {
        setStatus(result.message || "Users imported successfully!");
        setSelectedFile(null); // Clear file upon success
      } else {
        setErrorStatus(result.error || "Failed to import users.");
      }
    } catch (err: any) {
      setErrorStatus(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-10 px-4 sm:px-8 md:px-12">
      <div className="max-w-[700px] mx-auto">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-gray-500 hover:text-black transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Portal
            </Link>
            <h1 className="text-3xl font-extrabold text-[#0d0e12] tracking-tight">
              User Import Portal
            </h1>
            <p className="text-[14px] text-gray-500 mt-1 font-medium">
              Batch create institutional accounts from spreadsheet spreadsheets.
            </p>
          </div>
          <Badge variant="outline" className="px-3.5 py-1.5 text-[12.5px] font-mono font-bold border-[#E6E2D8] bg-[#F4F2EC] text-gray-700 self-start sm:self-auto">
            Excel Utility
          </Badge>
        </div>

        {/* Form Container */}
        <Card className="bg-white border border-[#E6E2D8]/70 rounded-[16px] p-6 sm:p-8 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-[18px] font-bold text-[#0d0e12] mb-1">
              Select spreadsheet file
            </h3>

            {/* Custom Drag and Drop zone */}
            <div
              onClick={handleTriggerInput}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-[12px] p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                isDragOver
                  ? "border-blue-600 bg-blue-50/30"
                  : selectedFile
                  ? "border-emerald-500 bg-emerald-50/10"
                  : "border-[#E6E2D8] hover:border-gray-400 bg-gray-50/40 hover:bg-gray-50/80"
              }`}
            >
              <input
                type="file"
                name="file"
                accept=".xlsx, .xls, .csv"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              {!selectedFile ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 bg-white border border-[#E6E2D8]/70 rounded-[10px] flex items-center justify-center mx-auto shadow-2xs">
                    <UploadCloud className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-[14.5px] font-bold text-[#0d0e12]">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-[12px] text-gray-500 mt-1 font-medium">
                      Supports Excel (.xlsx, .xls) and CSV files
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 w-full justify-between bg-[#FAF9F6] border border-[#E6E2D8]/70 rounded-[8px] p-4 text-left">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-[#EBF3FE] border border-[#C8E1FC] rounded-[8px] flex items-center justify-center shrink-0">
                      <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold text-[#0d0e12] truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[12px] text-gray-500 font-medium">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="p-1.5 hover:bg-gray-200 text-gray-400 hover:text-black rounded-full transition-colors cursor-pointer border-0 bg-transparent"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Instruction Callout */}
            <div className="bg-[#FAF9F6] border border-[#E6E2D8]/70 rounded-[12px] p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-400 shrink-0" />
                <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                  Spreadsheet Layout Specifications
                </h4>
              </div>
              <ul className="text-[13px] text-gray-600 space-y-2 list-disc list-inside font-medium leading-relaxed">
                <li>
                  <strong className="text-[#0d0e12]">Email</strong> column is mandatory.
                </li>
                <li>
                  Optional <strong className="text-[#0d0e12]">Name</strong> column (defaults to "User").
                </li>
                <li>
                  Optional <strong className="text-[#0d0e12]">Password</strong> column (hashes automatically).
                </li>
                <li>
                  Existing user emails will be skipped during processing.
                </li>
              </ul>
            </div>

            {/* Status Feedback Panels */}
            {status && (
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-[12px] p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[14px] font-bold text-emerald-800">Success</h4>
                  <p className="text-[13px] text-emerald-700 mt-1 font-medium leading-normal">
                    {status}
                  </p>
                </div>
              </div>
            )}

            {errorStatus && (
              <div className="bg-rose-50/50 border border-rose-200 rounded-[12px] p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[14px] font-bold text-rose-800">Import Error</h4>
                  <p className="text-[13px] text-rose-700 mt-1 font-medium leading-normal">
                    {errorStatus}
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!selectedFile || loading}
              className="w-full bg-[#0056cc] hover:bg-[#0047b3] text-white font-bold py-3.5 rounded-[8px] text-[14px] flex items-center justify-center gap-2 border-0 cursor-pointer disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  Processing Spreadsheet...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4.5 h-4.5" />
                  Upload & Register Users
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}