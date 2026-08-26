import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FormBuilder from "@/components/forms/builder/FormBuilder";
import { draftFromForm } from "@/lib/form-schema";
import { loadForm } from "@/lib/forms";

export const revalidate = 0;

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    redirect("/signin");
  }

  const { id } = await params;
  const form = await loadForm(id);
  if (!form) notFound();

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E6E2D8] bg-white px-6 py-3">
        <div>
          <Link
            href="/admin/forms"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-gray-500 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            All forms
          </Link>
          <h1 className="mt-1 text-xl font-extrabold tracking-tight text-[#0d0e12]">
            {form.title}
          </h1>
        </div>

        {!form.acceptingResponses && (
          <Badge
            variant="outline"
            className="border-[#E6E2D8] bg-[#F4F2EC] px-3 py-1.5 text-[12.5px] font-bold text-gray-700"
          >
            Closed
          </Badge>
        )}
      </header>

      <FormBuilder formId={form._id.toString()} initialDraft={draftFromForm(form)} />
    </div>
  );
}
