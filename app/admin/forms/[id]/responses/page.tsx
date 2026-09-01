import { notFound } from "next/navigation";
import ResponsesTable from "@/components/forms/ResponsesTable";
import { listResponses, loadForm } from "@/lib/forms";

export const revalidate = 0;

export default async function FormResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const form = await loadForm(id);
  if (!form) notFound();

  const responses = await listResponses(id);

  return (
    <ResponsesTable
      formId={form._id.toString()}
      questions={form.questions}
      responses={responses}
    />
  );
}
