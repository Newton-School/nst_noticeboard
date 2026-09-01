"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AnswerValue, IQuestion, ResponseRow } from "@/types/form";

function labelFor(question: IQuestion, value: AnswerValue): string {
  if (value === undefined || value === null) return "";

  if (!question.choices?.length) {
    return Array.isArray(value) ? value.join(", ") : String(value);
  }

  const labelOf = (id: string) =>
    question.choices?.find((choice) => choice.id === id)?.label ?? id;

  return Array.isArray(value)
    ? value.map(labelOf).join(", ")
    : labelOf(String(value));
}

function formatDate(value: string): string {
  try {
    return format(new Date(value), "dd MMM yyyy, HH:mm");
  } catch {
    return value;
  }
}

export default function ResponsesTable({
  formId,
  questions,
  responses,
}: {
  formId: string;
  questions: IQuestion[];
  responses: ResponseRow[];
}) {
  const [open, setOpen] = useState<string | null>(null);

  if (responses.length === 0) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="rounded-[10px] border border-dashed border-[#E6E2D8] bg-white p-10 text-center">
          <p className="text-[15px] font-bold text-[#0d0e12]">
            No responses yet
          </p>
          <p className="mt-1 text-[13.5px] text-gray-500">
            Share the form link and responses will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 px-4 py-8">
      <div className="flex items-center justify-between">
        <p className="text-[13.5px] font-bold text-gray-600">
          {responses.length}{" "}
          {responses.length === 1 ? "response" : "responses"}
        </p>

        <a
          href={`/admin/forms/${formId}/responses/export`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Download />
          Download CSV
        </a>
      </div>

      <div className="overflow-x-auto rounded-[10px] border border-[#E6E2D8] bg-white">
        <table className="w-full min-w-160 text-left text-[13.5px]">
          <thead className="border-b border-[#E6E2D8] bg-[#F4F2EC]">
            <tr>
              <th className="px-4 py-3 font-bold text-gray-700">Submitted</th>
              <th className="px-4 py-3 font-bold text-gray-700">Respondent</th>
              {questions.map((question) => (
                <th
                  key={question.id}
                  className="px-4 py-3 font-bold text-gray-700"
                >
                  {question.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.map((response) => (
              <tr
                key={response._id}
                onClick={() =>
                  setOpen(open === response._id ? null : response._id)
                }
                className="cursor-pointer border-b border-[#E6E2D8] last:border-b-0 hover:bg-[#FAF9F6]"
              >
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {formatDate(response.submittedAt)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                  {response.respondentEmail ?? (
                    <span className="text-gray-400">Anonymous</span>
                  )}
                </td>
                {questions.map((question) => (
                  <td key={question.id} className="px-4 py-3 text-gray-800">
                    {labelFor(question, response.answers[question.id]) || (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="rounded-[10px] border border-[#E6E2D8] bg-white p-5">
          <h2 className="text-[15px] font-extrabold text-[#0d0e12]">
            Response detail
          </h2>
          {(() => {
            const response = responses.find((item) => item._id === open);
            if (!response) return null;

            return (
              <dl className="mt-4 space-y-3">
                {questions.map((question) => (
                  <div key={question.id}>
                    <dt className="text-[13px] font-bold text-gray-500">
                      {question.title}
                    </dt>
                    <dd className="mt-0.5 text-[14px] text-gray-900">
                      {labelFor(question, response.answers[question.id]) || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            );
          })()}
        </div>
      )}
    </div>
  );
}
