import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FloatingContactButtons } from "@/components/floating-contact-buttons";
import { dictionaries, getLocale } from "@/lib/i18n";
import { getSiteContent } from "@/lib/cms";

const headingFont = Baloo_2({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent("id");
  return {
    metadataBase: new URL("https://berswara-rent.example"),
    title: "Berswara Baby Rent | Premium Baby Equipment Rental Bandung",
    description:
      "Rent premium and clean baby gear from Berswara Baby Rent in Bandung, Jawa Barat.",
    alternates: { canonical: "/" },
    icons: {
      icon: content.faviconImage,
      shortcut: content.faviconImage,
      apple: content.faviconImage,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  const content = await getSiteContent(locale);
  return (
    <html
      lang={locale}
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <SiteHeader locale={locale} labels={dict.header} logoImage={content.logoImage} />
        {children}
        <SiteFooter
          labels={{
            ...dict.footer,
            catalog: dict.header.catalog,
            about: dict.header.about,
          }}
        />
        <FloatingContactButtons locale={locale} contact={content.contact} />
      </body>
    </html>
  );
}
