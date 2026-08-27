import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FormTabs from "@/components/forms/FormTabs";
import { listResponses, loadForm } from "@/lib/forms";

export const revalidate = 0;

export default async function FormAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    redirect("/signin");
  }

  const { id } = await params;
  const form = await loadForm(id);
  if (!form) notFound();

  const responses = await listResponses(id);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <header className="border-b border-[#E6E2D8] bg-white px-6 pt-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
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

          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={
                form.acceptingResponses
                  ? "border-green-200 bg-green-50 px-3 py-1.5 text-[12px] font-bold text-green-700"
                  : "border-[#E6E2D8] bg-[#F4F2EC] px-3 py-1.5 text-[12px] font-bold text-gray-600"
              }
            >
              {form.acceptingResponses ? "Open" : "Closed"}
            </Badge>

            <Link
              href={`/forms/${form._id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-gray-500 transition-colors hover:text-black"
            >
              Open live form
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-3">
          <FormTabs
            formId={form._id.toString()}
            responseCount={responses.length}
          />
        </div>
      </header>

      {children}
    </div>
  );
}
