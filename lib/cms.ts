import { cache } from "react";
import { products as fallbackProducts, type Product } from "@/lib/products";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n";

export type SiteContent = {
  heroImage: string;
  logoImage: string;
  faviconImage: string;
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  aboutSummary: string;
  howToRentTitle: string;
  howToRentSteps: string[];
  contact: {
    whatsapp: string;
    instagram: string;
    location: string;
  };
  benefits: Array<{ title: string; description: string }>;
  testimonials: string[];
  faqs: Array<{ q: string; a: string }>;
};

const defaultContent: Record<Locale, SiteContent> = {
  id: {
    heroImage: "/images/hero-baby-stroller.svg",
    logoImage: "/favicon.ico",
    faviconImage: "/favicon.ico",
    heroBadge: "Aman • Bersih • Siap Pakai",
    heroTitle: "Sewa Perlengkapan Bayi Premium di Bandung",
    heroDescription: "Pilihan sewa stroller, push walker, dan push bike yang aman, bersih, dan praktis.",
    aboutSummary: "Kami membantu keluarga di Bandung mengakses perlengkapan bayi premium tanpa biaya kepemilikan dan beban penyimpanan yang tinggi.",
    howToRentTitle: "Cara Sewa",
    howToRentSteps: [
      "Pilih perlengkapan dari katalog.",
      "Cek ketersediaan via WhatsApp.",
      "Konfirmasi booking, deposit, dan pembayaran.",
      "Jadwalkan pengantaran atau pengambilan di Bandung.",
    ],
    contact: {
      whatsapp: "+62 812-3456-7890",
      instagram: "@berswararent",
      location: "Bandung, Jawa Barat",
    },
    benefits: [
      {
        title: "Higienitas Utama",
        description: "Semua item disanitasi sebelum dan sesudah setiap penyewaan.",
      },
      {
        title: "Brand Premium",
        description: "Perlengkapan terpercaya untuk kenyamanan, keamanan, dan keandalan.",
      },
      {
        title: "Sewa Fleksibel",
        description: "Paket mingguan dan bulanan untuk kebutuhan jangka pendek maupun panjang.",
      },
    ],
    testimonials: [
      "Stroller bersih dan anak nyaman selama liburan.",
      "Proses sewa cepat, admin ramah, dan sangat membantu.",
      "Push walker bagus, kondisi mulus, pengiriman tepat waktu.",
    ],
    faqs: [
      {
        q: "Apakah ada deposit?",
        a: "Ya, beberapa produk memerlukan deposit yang akan dikembalikan setelah item dicek saat pengembalian.",
      },
      {
        q: "Bagaimana jika telat mengembalikan?",
        a: "Kami bantu perpanjangan selama stok tersedia. Biaya tambahan dihitung per hari.",
      },
      {
        q: "Apakah produk selalu disanitasi?",
        a: "Semua produk dibersihkan dan disanitasi sebelum dikirim ke pelanggan berikutnya.",
      },
    ],
  },
  en: {
    heroImage: "/images/hero-baby-stroller.svg",
    logoImage: "/favicon.ico",
    faviconImage: "/favicon.ico",
    heroBadge: "Safe • Clean • Ready to Use",
    heroTitle: "Cute Premium Baby Gear Rental in Bandung",
    heroDescription: "Safe, clean, and practical rental options for strollers, push walkers, and push bikes.",
    aboutSummary: "We help families in Bandung access premium baby gear without high ownership cost or storage burden.",
    howToRentTitle: "How to Rent",
    howToRentSteps: [
      "Choose your gear from the catalog.",
      "Check availability via WhatsApp.",
      "Confirm booking, deposit, and payment.",
      "Schedule delivery or pick-up in Bandung.",
    ],
    contact: {
      whatsapp: "+62 812-3456-7890",
      instagram: "@berswararent",
      location: "Bandung, West Java",
    },
    benefits: [
      {
        title: "Hygiene First",
        description: "All items are sanitized before and after each rental.",
      },
      {
        title: "Premium Brands",
        description: "Trusted gear selected for comfort, safety, and reliability.",
      },
      {
        title: "Flexible Rental",
        description: "Weekly and monthly plans for short visits or longer use.",
      },
    ],
    testimonials: [
      "The stroller was clean and my child felt comfortable.",
      "Rental process was quick, and the team was very helpful.",
      "Great push walker, excellent condition, on-time delivery.",
    ],
    faqs: [
      {
        q: "Is a deposit required?",
        a: "Yes, some products require a deposit that is returned after post-rental inspection.",
      },
      {
        q: "What if I return late?",
        a: "We can extend your rental if stock is available. Extra fees are calculated per day.",
      },
      {
        q: "Are products sanitized?",
        a: "Every item is cleaned and sanitized before it is delivered to the next customer.",
      },
    ],
  },
};

export const getSiteContent = cache(async (locale: Locale): Promise<SiteContent> => {
  if (!hasSupabaseEnv()) return defaultContent[locale];

  try {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.from("site_content").select("value").eq("key", "site").eq("locale", locale).maybeSingle();
    if (!data?.value) return defaultContent[locale];
    const base = defaultContent[locale];
    const value = data.value as Partial<SiteContent>;
    return {
      ...base,
      ...value,
      contact: {
        ...base.contact,
        ...(value.contact ?? {}),
      },
      benefits: Array.isArray(value.benefits) ? value.benefits : base.benefits,
      testimonials: Array.isArray(value.testimonials) ? value.testimonials : base.testimonials,
      faqs: Array.isArray(value.faqs) ? value.faqs : base.faqs,
      howToRentSteps: Array.isArray(value.howToRentSteps) ? value.howToRentSteps : base.howToRentSteps,
    };
  } catch {
    return defaultContent[locale];
  }
});

export const getDynamicProducts = cache(async (): Promise<Product[]> => {
  if (!hasSupabaseEnv()) return fallbackProducts;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("products").select("*").order("name", { ascending: true });
    if (error || !data?.length) return fallbackProducts;

    return data.map((item) => {
      const prices = Array.isArray(item.price_options)
        ? item.price_options
            .map((price: { label?: string; amount?: number }) => ({
              label: String(price?.label ?? "").trim(),
              amount: Number(price?.amount ?? 0),
            }))
            .filter((price: { label: string; amount: number }) => price.label && price.amount > 0)
        : [];

      const fallbackPrices = [
        { label: "Weekly", amount: item.weekly_price },
        { label: "Monthly", amount: item.monthly_price },
      ].filter((price) => Number(price.amount) > 0);

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        brand: item.brand,
        prices: prices.length ? prices : fallbackPrices,
        weeklyPrice: item.weekly_price,
        monthlyPrice: item.monthly_price,
        description: item.description,
        features: item.features ?? [],
        ageRange: item.age_range,
        weightCapacity: item.weight_capacity,
        dimensions: item.dimensions,
        availability: item.availability,
        featured: item.featured,
        availabilityLastUpdated: item.availability_last_updated,
        availabilityCalendar: item.availability_calendar ?? [],
        photos: item.photos ?? [],
        videos: item.videos ?? [],
      };
    }) as Product[];
  } catch {
    return fallbackProducts;
  }
});
