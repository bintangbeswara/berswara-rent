import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product-gallery";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { getDynamicProducts, getSiteContent } from "@/lib/cms";
import { createWhatsAppLink, formatCategoryLabel, formatIdr } from "@/lib/products";
import { getLocale } from "@/lib/i18n";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const products = await getDynamicProducts();
  const product = products.find((item) => item.id === id);
  if (!product) return {};

  return {
    title: `Rent ${product.name} in Bandung - ${formatCategoryLabel(product.category)} | Berswara Baby Rent`,
    description: `Rent ${product.name} in Bandung for only ${formatIdr(product.weeklyPrice)}/week. Safe, sanitized, and ready for your little one.`,
    alternates: { canonical: `/product/${product.id}` },
  };
}

export default async function ProductPage({ params }: Props) {
  const locale = await getLocale();
  const isId = locale === "id";
  const { id } = await params;
  const products = await getDynamicProducts();
  const content = await getSiteContent(locale);
  const product = products.find((item) => item.id === id);
  if (!product) notFound();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: product.brand,
    category: formatCategoryLabel(product.category),
    offers: {
      "@type": "Offer",
      priceCurrency: "IDR",
      price: product.weeklyPrice,
      availability: product.availability ? "https://schema.org/InStock" : "https://schema.org/LimitedAvailability",
    },
  };

  const videoSchema = product.videos.map((video) => ({
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${product.name} Demo`,
    embedUrl: video,
  }));

  return (
    <main className="mx-auto flex-1 max-w-6xl px-4 py-10">
      <nav className="mb-5 text-sm text-[var(--muted)]">
        <Link href="/">{isId ? "Beranda" : "Home"}</Link> / <Link href="/catalog">{isId ? "Katalog" : "Catalog"}</Link> /{" "}
        <Link href={`/category/${product.category}`}>{formatCategoryLabel(product.category)}</Link> / {product.name}
      </nav>
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery name={product.name} photos={product.photos} videos={product.videos} locale={locale} />
        <section className="space-y-5">
          <h1 className="text-3xl font-semibold">{product.name}</h1>
          <p className="text-sm text-[var(--muted)]">{product.brand}</p>
          <p className={`text-sm font-medium ${product.availability ? "text-[var(--brand-secondary)]" : "text-[var(--brand-primary)]"}`}>
            {product.availability ? (isId ? "Tersedia untuk disewa" : "Available for rent") : isId ? "Mohon konfirmasi ketersediaan" : "Please confirm availability"}
          </p>
          <table className="w-full overflow-hidden rounded border border-[var(--brand-soft)] text-sm">
            <tbody>
              {product.prices.length ? (
                product.prices.map((price, index) => (
                  <tr key={`${price.label}-${index}`} className={index < product.prices.length - 1 ? "border-b border-[var(--brand-soft)]" : ""}>
                    <td className="p-2">{price.label}</td>
                    <td className="p-2 font-medium">{formatIdr(price.amount)}</td>
                  </tr>
                ))
              ) : (
                <>
                  <tr className="border-b border-[var(--brand-soft)]"><td className="p-2">{isId ? "Mingguan" : "Weekly"}</td><td className="p-2 font-medium">{formatIdr(product.weeklyPrice)}</td></tr>
                  <tr><td className="p-2">{isId ? "Bulanan" : "Monthly"}</td><td className="p-2 font-medium">{formatIdr(product.monthlyPrice)}</td></tr>
                </>
              )}
            </tbody>
          </table>
          <p className="text-sm text-[var(--muted)]">{product.description}</p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-[var(--muted)]">{isId ? "Rentang Usia" : "Age Range"}</dt><dd>{product.ageRange}</dd></div>
            <div><dt className="text-[var(--muted)]">{isId ? "Kapasitas Berat" : "Weight Capacity"}</dt><dd>{product.weightCapacity}</dd></div>
            <div className="col-span-2"><dt className="text-[var(--muted)]">{isId ? "Dimensi" : "Dimensions"}</dt><dd>{product.dimensions}</dd></div>
          </dl>
          <a
            href={createWhatsAppLink(product.name, content.contact.whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            className="sticky bottom-3 inline-flex rounded bg-[var(--brand-primary)] px-4 py-3 text-sm font-medium text-white hover:opacity-90"
          >
            {isId ? "Cek Ketersediaan via WhatsApp" : "Check Availability on WhatsApp"}
          </a>
          <AvailabilityCalendar product={product} locale={locale} />
        </section>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">{isId ? "Rekomendasi Produk Lainnya" : "You might also like"}</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {products.filter((item) => item.id !== product.id).slice(0, 3).map((item) => (
            <Link key={item.id} href={`/product/${item.id}`} className="rounded border border-[var(--brand-soft)] bg-[var(--surface)] p-4 text-sm hover:border-[var(--brand-primary)]">
              {item.name}
            </Link>
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      {videoSchema.map((schema, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
    </main>
  );
}
