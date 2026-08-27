import { notFound } from "next/navigation";
import FormBuilder from "@/components/forms/builder/FormBuilder";
import { draftFromForm } from "@/lib/form-schema";
import { loadForm } from "@/lib/forms";

export const revalidate = 0;

export default async function EditFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const form = await loadForm(id);
  if (!form) notFound();

  return (
    <FormBuilder formId={form._id.toString()} initialDraft={draftFromForm(form)} />
  );
}
