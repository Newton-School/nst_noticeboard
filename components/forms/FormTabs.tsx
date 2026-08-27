"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function FormTabs({
  formId,
  responseCount,
}: {
  formId: string;
  responseCount: number;
}) {
  const pathname = usePathname();
  const base = `/admin/forms/${formId}`;

  const tabs = [
    { href: base, label: "Questions" },
    { href: `${base}/settings`, label: "Settings" },
    { href: `${base}/responses`, label: `Responses (${responseCount})` },
  ];

  return (
    <nav className="flex gap-1 border-b border-[#E6E2D8]">
      {tabs.map((tab) => {
        const active = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px border-b-2 px-4 py-2.5 text-[13.5px] font-bold transition-colors",
              active
                ? "border-[#121316] text-[#0d0e12]"
                : "border-transparent text-gray-500 hover:text-black",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
