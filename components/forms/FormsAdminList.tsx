"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ExternalLink, Link2, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { deleteForm, setAcceptingResponses } from "@/app/actions/DeleteForm";
import { FormSummary } from "@/types/form";

function formatDate(value: string): string {
  try {
    return format(new Date(value), "dd MMM, yyyy");
  } catch {
    return "Recently";
  }
}

export default function FormsAdminList({ forms }: { forms: FormSummary[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function run(action: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch {
        setError("That action could not be completed. Please try again.");
      }
    });
  }

  async function copyLink(formId: string) {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/forms/${formId}`,
      );
      setCopiedId(formId);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("The link could not be copied.");
    }
  }

  if (forms.length === 0) {
    return (
      <div className="rounded-[10px] border border-dashed border-[#E6E2D8] bg-white p-10 text-center">
        <p className="text-[15px] font-bold text-[#0d0e12]">No forms yet</p>
        <p className="mt-1 text-[13.5px] text-gray-500">
          Build your first form to start collecting responses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {forms.map((form) => (
        <div
          key={form._id}
          className="flex flex-col gap-3 rounded-[10px] border border-[#E6E2D8] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-[15px] font-bold text-[#0d0e12]">
                {form.title}
              </h2>
              <Badge
                variant="outline"
                className={
                  form.acceptingResponses
                    ? "border-green-200 bg-green-50 text-[11.5px] font-bold text-green-700"
                    : "border-[#E6E2D8] bg-[#F4F2EC] text-[11.5px] font-bold text-gray-600"
                }
              >
                {form.acceptingResponses ? "Open" : "Closed"}
              </Badge>
            </div>
            <p className="mt-1 text-[13px] text-gray-500">
              {form.questionCount}{" "}
              {form.questionCount === 1 ? "question" : "questions"} ·{" "}
              {form.responseCount}{" "}
              {form.responseCount === 1 ? "response" : "responses"} · Updated{" "}
              {formatDate(form.updatedAt)}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyLink(form._id)}
              title="Copy the public link"
            >
              <Link2 />
              {copiedId === form._id ? "Copied" : "Copy link"}
            </Button>

            <Link
              href={`/forms/${form._id}`}
              target="_blank"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <ExternalLink />
              Open
            </Link>

            <Button
              variant="soft"
              size="sm"
              disabled={pending}
              onClick={() =>
                run(() =>
                  setAcceptingResponses(form._id, !form.acceptingResponses),
                )
              }
            >
              {form.acceptingResponses ? "Close" : "Reopen"}
            </Button>

            <Link
              href={`/admin/forms/${form._id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Pencil />
              Edit
            </Link>

            <Button
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={() => {
                const warning =
                  form.responseCount > 0
                    ? `Delete "${form.title}" and its ${form.responseCount} response(s)? This cannot be undone.`
                    : `Delete "${form.title}"? This cannot be undone.`;
                if (window.confirm(warning)) run(() => deleteForm(form._id));
              }}
            >
              <Trash2 />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
