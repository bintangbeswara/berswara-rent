import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FloatingContactButtons } from "@/components/floating-contact-buttons";
import { dictionaries, getLocale } from "@/lib/i18n";
import { getSiteContent } from "@/lib/cms";
import { getSiteUrl } from "@/lib/seo";

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
  const siteUrl = getSiteUrl();
  const metadataBase = new URL(siteUrl);
  const iconUrl = content.faviconImage?.startsWith("http")
    ? content.faviconImage
    : `${siteUrl}${content.faviconImage}`;
  const ogImage = `${siteUrl}/images/hero-baby-stroller.svg`;

  return {
    metadataBase,
    title: "Berswara Baby Rent | Premium Baby Equipment Rental Bandung",
    description:
      "Rent premium and clean baby gear from Berswara Baby Rent in Bandung, Jawa Barat.",
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: siteUrl,
      siteName: "Berswara Baby Rent",
      title: "Berswara Baby Rent | Premium Baby Equipment Rental Bandung",
      description: "Rent premium and clean baby gear from Berswara Baby Rent in Bandung, Jawa Barat.",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Berswara Baby Rent hero image" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Berswara Baby Rent | Premium Baby Equipment Rental Bandung",
      description: "Rent premium and clean baby gear from Berswara Baby Rent in Bandung, Jawa Barat.",
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    icons: {
      icon: iconUrl,
      shortcut: iconUrl,
      apple: iconUrl,
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
