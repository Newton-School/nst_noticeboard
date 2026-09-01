import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import FormsAdminList from "@/components/forms/FormsAdminList";
import { listForms } from "@/lib/forms";

export const revalidate = 0;

export default async function AdminFormsPage() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    redirect("/signin");
  }

  const forms = await listForms();

  return (
    <div className="min-h-screen bg-[#FAF9F6] px-4 py-8 sm:px-8 md:px-12">
      <div className="mx-auto max-w-310">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/"
              className="mb-2 inline-flex items-center gap-1.5 text-[13.5px] font-bold text-gray-500 transition-colors hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Portal
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0d0e12] sm:text-[34px]">
              Forms
            </h1>
            <p className="mt-1 text-[14px] font-medium text-gray-500">
              Build forms, share the link, and collect responses.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <Badge
              variant="outline"
              className="border-[#E6E2D8] bg-[#F4F2EC] px-3.5 py-1.5 font-mono text-[12.5px] font-bold text-gray-700"
            >
              Admin: {session.user?.email}
            </Badge>
            <Link href="/admin/forms/new" className={buttonVariants()}>
              <Plus />
              New form
            </Link>
          </div>
        </div>

        <FormsAdminList forms={forms} />
      </div>
    </div>
  );
}
