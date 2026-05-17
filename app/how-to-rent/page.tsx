import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { getSiteContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "How to Rent | Berswara Baby Rent",
  description: "Simple steps to rent baby gear from Berswara Baby Rent in Bandung.",
  alternates: { canonical: "/how-to-rent" },
};

export default async function HowToRentPage() {
  const locale = await getLocale();
  const isId = locale === "id";
  const content = await getSiteContent(locale);
  const steps = content.howToRentSteps;
  return (
    <main className="mx-auto flex-1 max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">{content.howToRentTitle}</h1>
      <ol className="mt-6 space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="rounded border border-[var(--brand-soft)] bg-[var(--surface)] p-4 text-sm">
            <span className="font-semibold">{isId ? `Langkah ${index + 1}:` : `Step ${index + 1}:`}</span> {step}
          </li>
        ))}
      </ol>
    </main>
  );
}
