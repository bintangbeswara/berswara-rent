export type Product = {
  id: string;
  name: string;
  category: string;
  brand: string;
  prices: Array<{
    label: string;
    amount: number;
  }>;
  weeklyPrice: number;
  monthlyPrice: number;
  description: string;
  features: string[];
  ageRange: string;
  weightCapacity: string;
  dimensions: string;
  availability: boolean;
  featured: boolean;
  availabilityLastUpdated: string;
  availabilityCalendar: Array<
    | {
        mode?: "single";
        date: string;
        status: "available" | "booked";
      }
    | {
        mode: "range";
        startDate: string;
        endDate: string;
        status: "available" | "booked";
      }
  >;
  photos: string[];
  videos: string[];
};

export const products: Product[] = [
  {
    id: "bugaboo-butterfly",
    name: "Bugaboo Butterfly",
    category: "strollers",
    brand: "Bugaboo",
    prices: [
      { label: "Weekly", amount: 250000 },
      { label: "Monthly", amount: 800000 },
    ],
    weeklyPrice: 250000,
    monthlyPrice: 800000,
    description:
      "Compact premium stroller for city trips and travel, with one-second fold.",
    features: ["One-hand fold", "Cabin-friendly size", "Large under-seat basket"],
    ageRange: "6 months - 4 years",
    weightCapacity: "22 kg",
    dimensions: "45 x 23 x 54 cm (folded)",
    availability: true,
    featured: true,
    availabilityLastUpdated: "2026-05-10",
    availabilityCalendar: [
      { date: "2026-05-18", status: "booked" },
      { date: "2026-05-19", status: "booked" },
      { date: "2026-05-24", status: "booked" },
    ],
    photos: [
      "/images/products/bugaboo-1.svg",
      "/images/products/bugaboo-2.svg",
      "/images/products/bugaboo-3.svg",
    ],
    videos: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
  },
  {
    id: "vtech-learning-walker",
    name: "VTech Learning Walker",
    category: "push-walkers",
    brand: "VTech",
    prices: [
      { label: "Weekly", amount: 150000 },
      { label: "Monthly", amount: 500000 },
    ],
    weeklyPrice: 150000,
    monthlyPrice: 500000,
    description:
      "Interactive push walker that supports early walking and motor development.",
    features: ["Removable activity panel", "Speed control wheel", "Music and sounds"],
    ageRange: "9 months - 3 years",
    weightCapacity: "20 kg",
    dimensions: "50 x 36 x 45 cm",
    availability: true,
    featured: true,
    availabilityLastUpdated: "2026-05-11",
    availabilityCalendar: [
      { date: "2026-05-20", status: "booked" },
      { date: "2026-05-21", status: "booked" },
      { date: "2026-05-22", status: "booked" },
    ],
    photos: [
      "/images/products/vtech-1.svg",
      "/images/products/vtech-2.svg",
      "/images/products/vtech-3.svg",
    ],
    videos: ["https://www.youtube.com/watch?v=aqz-KE-bpKQ"],
  },
  {
    id: "doona-liki-trike",
    name: "Doona Liki Trike",
    category: "push-bikes",
    brand: "Doona",
    prices: [
      { label: "Weekly", amount: 280000 },
      { label: "Monthly", amount: 900000 },
    ],
    weeklyPrice: 280000,
    monthlyPrice: 900000,
    description:
      "Foldable premium trike designed for comfort, control, and compact storage.",
    features: ["Compact fold", "Parent control bar", "5-point harness"],
    ageRange: "10 months - 3 years",
    weightCapacity: "20 kg",
    dimensions: "34 x 31 x 59 cm (folded)",
    availability: false,
    featured: true,
    availabilityLastUpdated: "2026-05-12",
    availabilityCalendar: [
      { date: "2026-05-16", status: "booked" },
      { date: "2026-05-17", status: "booked" },
      { date: "2026-05-18", status: "booked" },
      { date: "2026-05-25", status: "booked" },
    ],
    photos: [
      "/images/products/doona-1.svg",
      "/images/products/doona-2.svg",
      "/images/products/doona-3.svg",
    ],
    videos: ["https://www.youtube.com/watch?v=ysz5S6PUM-U"],
  },
];

export function formatIdr(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((product) => product.category === category);
}

export function formatCategoryLabel(category: string): string {
  return category
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toWhatsappNumber(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return "";
  return digitsOnly.startsWith("0") ? `62${digitsOnly.slice(1)}` : digitsOnly;
}

export function createWhatsAppLink(productName: string, whatsappNumber: string): string {
  const message = `Hi Berswara Baby Rent, I'm interested in renting the ${productName}. Is it available for [Dates]?`;
  return `https://wa.me/${toWhatsappNumber(whatsappNumber)}?text=${encodeURIComponent(message)}`;
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateString}T00:00:00`));
}
