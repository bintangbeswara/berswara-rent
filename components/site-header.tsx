"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

export function SiteHeader({
  locale,
  labels,
  logoImage,
}: {
  locale: Locale;
  labels: {
    home: string;
    catalog: string;
    howToRent: string;
    about: string;
    language: string;
  };
  logoImage: string;
}) {
  const [open, setOpen] = useState(false);
  const navItems = [
    { href: "/", label: labels.home },
    { href: "/catalog", label: labels.catalog },
    { href: "/how-to-rent", label: labels.howToRent },
    { href: "/about", label: labels.about },
  ];

  async function onLocaleChange(nextLocale: Locale) {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    });
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-40 px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between rounded-3xl border border-[var(--brand-soft)] bg-[var(--surface)] px-5 py-3 shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-[var(--brand-secondary)]">
          <Image src={logoImage} alt="Berswara Baby Rent logo" width={24} height={24} className="h-6 w-6 rounded" />
          <span>Berswara Baby Rent</span>
        </Link>
        <button
          type="button"
          aria-label="Toggle navigation menu"
          className="rounded-full border border-[var(--brand-soft)] bg-[var(--brand-accent)] px-3 py-1 text-sm md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
        <nav className="hidden items-center gap-4 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-[var(--muted)] hover:text-[var(--brand-primary)]">
              {item.label}
            </Link>
          ))}
          {/*<label className="text-sm text-[var(--muted)]">*/}
          {/*  {labels.language}*/}
          {/*  <select*/}
          {/*    className="ml-2 rounded-full border border-[var(--brand-soft)] bg-white px-2 py-1"*/}
          {/*    value={locale}*/}
          {/*    onChange={(event) => void onLocaleChange(event.target.value as Locale)}*/}
          {/*  >*/}
          {/*    <option value="id">ID</option>*/}
          {/*    <option value="en">EN</option>*/}
          {/*  </select>*/}
          {/*</label>*/}
        </nav>
      </div>
      {open ? (
        <nav className="mx-auto mt-2 max-w-6xl rounded-3xl border border-[var(--brand-soft)] bg-[var(--surface)] px-4 py-3 shadow-sm md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-[var(--muted)]" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <label className="text-sm text-[var(--muted)]">
              {labels.language}
              <select
                className="ml-2 rounded-full border border-[var(--brand-soft)] bg-white px-2 py-1"
                value={locale}
                onChange={(event) => void onLocaleChange(event.target.value as Locale)}
              >
                <option value="id">ID</option>
                <option value="en">EN</option>
              </select>
            </label>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
