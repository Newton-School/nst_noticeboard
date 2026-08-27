import { NextResponse } from "next/server";
import { utils, write } from "xlsx";
import { auth } from "@/auth";
import { listResponses, loadForm } from "@/lib/forms";
import { AnswerValue, IQuestion } from "@/types/form";

function cellFor(question: IQuestion, value: AnswerValue): string {
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const form = await loadForm(id);
  if (!form) {
    return new NextResponse("Not found", { status: 404 });
  }

  const responses = await listResponses(id);

  const rows = responses.map((response) => {
    const row: Record<string, string> = {
      Submitted: response.submittedAt,
      Respondent: response.respondentEmail ?? "Anonymous",
    };

    for (const question of form.questions) {
      row[question.title || question.id] = cellFor(
        question,
        response.answers[question.id],
      );
    }

    return row;
  });

  const sheet = utils.json_to_sheet(rows);
  const book = utils.book_new();
  utils.book_append_sheet(book, sheet, "Responses");
  const csv = write(book, { bookType: "csv", type: "string" }) as string;

  const filename = `${form.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "form"}-responses.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
