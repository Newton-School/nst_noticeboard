import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import FormBuilder from "@/components/forms/builder/FormBuilder";
import { newFormDraft } from "@/lib/form-schema";

export default async function NewFormPage() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    redirect("/signin");
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <header className="border-b border-[#E6E2D8] bg-white px-6 py-3">
        <Link
          href="/admin/forms"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-gray-500 transition-colors hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          All forms
        </Link>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight text-[#0d0e12]">
          New form
        </h1>
      </header>

      <FormBuilder formId={null} initialDraft={newFormDraft()} />
    </div>
  );
}
