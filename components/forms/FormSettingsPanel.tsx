"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateFormSettings } from "@/app/actions/UpdateFormSettings";
import { FormSettings } from "@/types/form";

function Toggle({
  id,
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 border-t border-[#E6E2D8] py-4 first:border-t-0 first:pt-0">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-4 rounded-lg accent-[#121316] disabled:opacity-50"
      />
      <div>
        <label
          htmlFor={id}
          className="block text-[14px] font-bold text-[#0d0e12]"
        >
          {label}
        </label>
        <p className="mt-0.5 text-[13px] text-gray-500">{hint}</p>
      </div>
    </div>
  );
}

export default function FormSettingsPanel({
  formId,
  initialSettings,
}: {
  formId: string;
  initialSettings: FormSettings;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [settings, setSettings] = useState<FormSettings>(initialSettings);
  const [message, setMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function update(patch: Partial<FormSettings>) {
    setSettings((current) => ({ ...current, ...patch }));
    setSaved(false);
    setMessage(null);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateFormSettings(formId, settings);

      if (result.status === "saved") {
        setSaved(true);
        router.refresh();
      } else if (result.status === "error") {
        setMessage(result.message);
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-8">
      <section className="rounded-[10px] border border-[#E6E2D8] bg-white p-5">
        <h2 className="text-[15px] font-extrabold text-[#0d0e12]">Responses</h2>
        <div className="mt-4">
          <Toggle
            id="acceptingResponses"
            label="Accepting responses"
            hint="Turn this off to close the form. Visitors will see the closed message below."
            checked={settings.acceptingResponses}
            onChange={(value) => update({ acceptingResponses: value })}
          />

          <Toggle
            id="oneResponsePerUser"
            label="Limit to one response per person"
            hint="Each person can submit only once, matched on their signed-in email."
            checked={settings.oneResponsePerUser}
            onChange={(value) => update({ oneResponsePerUser: value })}
          />
        </div>

        <p className="mt-4 rounded-[10px] bg-[#F4F2EC] px-3 py-2.5 text-[13px] text-gray-600">
          Every form requires respondents to sign in, so each response is always
          recorded against an email address.
        </p>
      </section>

      <section className="rounded-[10px] border border-[#E6E2D8] bg-white p-5">
        <h2 className="text-[15px] font-extrabold text-[#0d0e12]">Messages</h2>

        <div className="mt-4 space-y-4">
          <div>
            <label
              htmlFor="confirmationMessage"
              className="block text-[13.5px] font-bold text-gray-700"
            >
              After submitting
            </label>
            <Input
              id="confirmationMessage"
              value={settings.confirmationMessage}
              onChange={(event) =>
                update({ confirmationMessage: event.target.value })
              }
              className="mt-1.5"
            />
          </div>

          <div>
            <label
              htmlFor="closedMessage"
              className="block text-[13.5px] font-bold text-gray-700"
            >
              When the form is closed
            </label>
            <Input
              id="closedMessage"
              value={settings.closedMessage}
              onChange={(event) => update({ closedMessage: event.target.value })}
              className="mt-1.5"
            />
          </div>
        </div>
      </section>

      {message && (
        <p role="alert" className="text-sm text-red-600">
          {message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="button" onClick={handleSave} disabled={pending}>
          {pending ? "Saving..." : "Save settings"}
        </Button>
        {saved && <span className="text-sm text-green-700">Saved</span>}
      </div>
    </div>
  );
}
