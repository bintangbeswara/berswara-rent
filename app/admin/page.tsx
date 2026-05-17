import Link from "next/link";
import { getSiteContent } from "@/lib/cms";
import { requireAdminPage } from "@/lib/admin-auth";
import { signOutAdmin, saveSiteContent, uploadSiteAsset } from "@/app/admin/actions";
import { AdminContentArraysEditor } from "@/components/admin-content-arrays-editor";
import type { Locale } from "@/lib/i18n";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPage({ searchParams }: Props) {
  const auth = await requireAdminPage();
  if (!auth.isAllowed) {
    return (
      <main className="mx-auto flex-1 max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="mt-3 text-sm text-red-600">
          This account is not allowed. Add `{auth.user.email}` to `ADMIN_EMAILS`.
        </p>
      </main>
    );
  }

  const params = await searchParams;
  const locale = (typeof params.locale === "string" ? params.locale : "id") as Locale;
  const invalidFields = new Set(
    typeof params.invalid === "string" ? params.invalid.split(",").map((item) => item.trim()).filter(Boolean) : [],
  );
  const hasValidationError = params.error === "validation";
  const isInvalid = (field: string) => invalidFields.has(field);
  const invalidInputClass = (field: string) =>
    `mt-1 w-full rounded border px-3 py-2 ${isInvalid(field) ? "border-red-500 ring-1 ring-red-200" : ""}`;
  const fieldLabels: Record<string, string> = {
    heroBadge: "Hero Badge",
    heroTitle: "Hero Title",
    heroDescription: "Hero Description",
    aboutSummary: "About Summary",
    howToRentTitle: "How To Rent Title",
    howToRentStepsText: "How To Rent Steps",
    contactWhatsapp: "WhatsApp",
    contactInstagram: "Instagram",
    contactLocation: "Location",
    benefitsJson: "Benefits",
    faqsJson: "FAQs",
  };
  const content = await getSiteContent(locale);

  return (
    <main className="mx-auto flex-1 max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Content Admin</h1>
          <p className="text-sm text-[var(--muted)]">Logged in as {auth.user.email}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products" className="rounded border border-[var(--brand-soft)] px-3 py-2 text-sm">
            Product Admin
          </Link>
          <Link href="/" className="rounded border border-[var(--brand-soft)] px-3 py-2 text-sm">
            View Site
          </Link>
          <form action={signOutAdmin}>
            <button type="submit" className="rounded bg-[var(--brand-secondary)] px-3 py-2 text-sm font-medium text-white">Sign out</button>
          </form>
        </div>
      </div>

      <div className="mb-4 inline-flex rounded border border-[var(--brand-soft)] bg-white p-1 text-sm">
        <Link
          href="/admin?locale=id"
          className={`rounded px-3 py-1 ${locale === "id" ? "bg-[var(--brand-secondary)] text-white" : "text-[var(--muted)]"}`}
        >
          Indonesia
        </Link>
        <Link
          href="/admin?locale=en"
          className={`rounded px-3 py-1 ${locale === "en" ? "bg-[var(--brand-secondary)] text-white" : "text-[var(--muted)]"}`}
        >
          English
        </Link>
      </div>

      <section className="rounded border border-[var(--brand-soft)] bg-[var(--surface)] p-5">
        <h2 className="text-xl font-semibold">Site Content ({locale.toUpperCase()})</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">Editing localized content for {locale === "id" ? "Indonesia" : "English"}.</p>
        {hasValidationError ? (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p className="font-semibold">Please fix invalid inputs:</p>
            <ul className="mt-1 list-disc pl-5">
              {Array.from(invalidFields).map((field) => (
                <li key={field}>{fieldLabels[field] ?? field}</li>
              ))}
            </ul>
          </div>
        ) : null}
        <form action={saveSiteContent} className="mt-5 space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="heroImage" value={content.heroImage} />
          <input type="hidden" name="logoImage" value={content.logoImage} />
          <input type="hidden" name="faviconImage" value={content.faviconImage} />
          <label className="block text-sm">Hero Badge *<input name="heroBadge" required defaultValue={content.heroBadge} className={invalidInputClass("heroBadge")} /></label>
          <label className="block text-sm">Hero Title *<input name="heroTitle" required defaultValue={content.heroTitle} className={invalidInputClass("heroTitle")} /></label>
          <label className="block text-sm">Hero Description *<textarea name="heroDescription" required defaultValue={content.heroDescription} className={invalidInputClass("heroDescription")} rows={3} /></label>
          <label className="block text-sm">About Summary *<textarea name="aboutSummary" required defaultValue={content.aboutSummary} className={invalidInputClass("aboutSummary")} rows={3} /></label>
          <label className="block text-sm">How To Rent Title *<input name="howToRentTitle" required defaultValue={content.howToRentTitle} className={invalidInputClass("howToRentTitle")} /></label>
          <label className="block text-sm">How To Rent Steps (one per line) *<textarea name="howToRentStepsText" required defaultValue={content.howToRentSteps.join("\n")} className={invalidInputClass("howToRentStepsText")} rows={4} /></label>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="block text-sm">WhatsApp *<input name="contactWhatsapp" required defaultValue={content.contact.whatsapp} className={invalidInputClass("contactWhatsapp")} /></label>
            <label className="block text-sm">Instagram *<input name="contactInstagram" required defaultValue={content.contact.instagram} className={invalidInputClass("contactInstagram")} /></label>
            <label className="block text-sm">Location *<input name="contactLocation" required defaultValue={content.contact.location} className={invalidInputClass("contactLocation")} /></label>
          </div>

          <AdminContentArraysEditor
            initialBenefits={content.benefits}
            initialTestimonials={content.testimonials}
            initialFaqs={content.faqs}
          />

          <button type="submit" className="rounded bg-[var(--brand-secondary)] px-4 py-2 text-sm font-medium text-white">Save Content</button>
        </form>

        <section className="mt-8 rounded border border-[var(--brand-soft)] p-4">
          <h3 className="text-sm font-semibold">Site Assets Upload</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <form action={uploadSiteAsset} className="rounded border border-[var(--brand-soft)] p-3">
              <input type="hidden" name="assetType" value="heroImage" />
              <p className="mb-2 text-xs font-medium">Hero Image</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.heroImage} alt="Current hero" className="mb-2 h-24 w-full rounded object-cover" />
              <input type="file" name="image" accept="image/*" required className="w-full text-xs" />
              <button type="submit" className="mt-2 w-full rounded bg-[var(--brand-secondary)] px-3 py-2 text-xs font-medium text-white">Upload Hero</button>
            </form>
            <form action={uploadSiteAsset} className="rounded border border-[var(--brand-soft)] p-3">
              <input type="hidden" name="assetType" value="logoImage" />
              <p className="mb-2 text-xs font-medium">Logo</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.logoImage} alt="Current logo" className="mb-2 h-24 w-full rounded object-contain bg-white" />
              <input type="file" name="image" accept="image/*" required className="w-full text-xs" />
              <button type="submit" className="mt-2 w-full rounded bg-[var(--brand-secondary)] px-3 py-2 text-xs font-medium text-white">Upload Logo</button>
            </form>
            <form action={uploadSiteAsset} className="rounded border border-[var(--brand-soft)] p-3">
              <input type="hidden" name="assetType" value="faviconImage" />
              <p className="mb-2 text-xs font-medium">Favicon</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={content.faviconImage} alt="Current favicon" className="mb-2 h-24 w-full rounded object-contain bg-white" />
              <input type="file" name="image" accept="image/*" required className="w-full text-xs" />
              <button type="submit" className="mt-2 w-full rounded bg-[var(--brand-secondary)] px-3 py-2 text-xs font-medium text-white">Upload Favicon</button>
            </form>
          </div>
        </section>
      </section>
    </main>
  );
}
