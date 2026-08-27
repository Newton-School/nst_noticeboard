import { notFound } from "next/navigation";
import FormSettingsPanel from "@/components/forms/FormSettingsPanel";
import { loadForm } from "@/lib/forms";

export const revalidate = 0;

export default async function FormSettingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const form = await loadForm(id);
  if (!form) notFound();

  return (
    <FormSettingsPanel
      formId={form._id.toString()}
      initialSettings={{
        acceptingResponses: form.acceptingResponses,
        oneResponsePerUser: form.oneResponsePerUser,
        confirmationMessage: form.confirmationMessage,
        closedMessage: form.closedMessage,
      }}
    />
  );
}
