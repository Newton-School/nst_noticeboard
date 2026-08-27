import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import FormRenderer from "@/components/forms/FormRenderer";
import { buttonVariants } from "@/components/ui/button";
import { hasAlreadyResponded, loadForm } from "@/lib/forms";

export const revalidate = 0;

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-2xl space-y-4 px-4 py-10">
      <div className="rounded-lg border bg-background p-6">
        <h1 className="text-2xl">{title}</h1>
        <div className="mt-4 text-sm">{children}</div>
      </div>
    </section>
  );
}

export default async function FormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const form = await loadForm(id);
  if (!form) notFound();

  if (!form.acceptingResponses) {
    return <Notice title={form.title}>{form.closedMessage}</Notice>;
  }

  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return (
      <Notice title={form.title}>
        <p>Please sign in to fill out this form.</p>
        <Link
          href={`/signin?callbackUrl=/forms/${form._id}`}
          className={`${buttonVariants()} mt-4`}
        >
          Sign in
        </Link>
      </Notice>
    );
  }

  if (form.oneResponsePerUser && (await hasAlreadyResponded(id, email))) {
    return (
      <Notice title={form.title}>
        You have already responded to this form.
      </Notice>
    );
  }

  return <FormRenderer form={form} />;
}
