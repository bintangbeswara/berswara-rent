import type { Locale } from "@/lib/i18n";
import type { SiteContent } from "@/lib/cms";

function toWhatsappNumber(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return "";
  return digitsOnly.startsWith("0") ? `62${digitsOnly.slice(1)}` : digitsOnly;
}

function toInstagramHref(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "https://instagram.com";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://instagram.com/${trimmed.replace(/^@+/, "")}`;
}

export function FloatingContactButtons({
  locale,
  contact,
}: {
  locale: Locale;
  contact: SiteContent["contact"];
}) {
  const isId = locale === "id";
  const message = isId
    ? "Halo Berswara Baby Rent, saya ingin tanya ketersediaan produk."
    : "Hi Berswara Baby Rent, I would like to ask about product availability.";
  const whatsappNumber = toWhatsappNumber(contact.whatsapp);
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  const instagramHref = toInstagramHref(contact.instagram);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2">
      <a
        href={instagramHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#E1306C] text-white shadow-md hover:-translate-y-0.5"
        aria-label="Instagram"
        title="Instagram"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-current">
          <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5a4.25 4.25 0 0 0 4.25-4.25v-8.5a4.25 4.25 0 0 0-4.25-4.25h-8.5Zm8.88 1.62a1.12 1.12 0 1 1 0 2.25 1.12 1.12 0 0 1 0-2.25ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
        </svg>
      </a>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md hover:-translate-y-0.5"
        aria-label={isId ? "Chat WhatsApp" : "WhatsApp Chat"}
        title="WhatsApp"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-current">
          <path d="M20.52 3.48A11.9 11.9 0 0 0 12.06 0C5.47 0 .1 5.37.1 11.97c0 2.11.55 4.18 1.59 6.01L0 24l6.2-1.63a11.93 11.93 0 0 0 5.86 1.5h.01c6.59 0 11.96-5.37 11.96-11.97 0-3.2-1.25-6.21-3.51-8.42ZM12.07 21.85h-.01a9.9 9.9 0 0 1-5.03-1.37l-.36-.21-3.68.97.98-3.59-.23-.37a9.9 9.9 0 0 1-1.52-5.31C2.22 6.5 6.6 2.12 12.06 2.12a9.8 9.8 0 0 1 6.99 2.9 9.83 9.83 0 0 1 2.9 7c0 5.46-4.42 9.84-9.88 9.84Zm5.43-7.38c-.3-.15-1.78-.88-2.05-.98-.27-.1-.47-.15-.67.15-.2.3-.77.98-.95 1.18-.17.2-.35.23-.65.08-.3-.15-1.27-.47-2.41-1.5-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.57-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.38-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.22 3.07c.15.2 2.1 3.2 5.08 4.48.71.31 1.27.49 1.7.62.71.23 1.36.2 1.87.12.57-.09 1.78-.73 2.03-1.43.25-.71.25-1.31.17-1.43-.07-.12-.27-.2-.57-.35Z" />
        </svg>
      </a>
    </div>
  );
}
