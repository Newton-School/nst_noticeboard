import { notFound } from "next/navigation";
import FormRenderer from "@/components/forms/FormRenderer";
import { loadForm } from "@/lib/forms";

export const revalidate = 0;

export default async function FormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const form = await loadForm(id);
  if (!form) notFound();

  if (!form.acceptingResponses) {
    return (
      <section className="mx-auto w-full max-w-2xl space-y-4 px-4 py-10">
        <div className="rounded-lg border bg-background p-6">
          <h1 className="text-2xl">{form.title}</h1>
          <p className="mt-4 text-sm">
            This form is no longer accepting responses.
          </p>
        </div>
      </section>
    );
  }

  return <FormRenderer form={form} />;
}
