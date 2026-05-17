"use server";

import slugify from "slugify";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminEmails } from "@/lib/supabase/config";
import type { Locale } from "@/lib/i18n";
import type { SiteContent } from "@/lib/cms";

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const allowedEmails = getAdminEmails();
  const currentEmail = user.email?.toLowerCase() ?? "";
  if (allowedEmails.length > 0 && !allowedEmails.includes(currentEmail)) {
    throw new Error("Your account is not listed in ADMIN_EMAILS");
  }

  return { supabase, user };
}

export async function signOutAdmin() {
  const { supabase } = await requireAdmin();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function saveSiteContent(formData: FormData) {
  const { supabase } = await requireAdmin();
  const locale = (formData.get("locale") as Locale) ?? "id";
  const invalidFields: string[] = [];
  const redirectValidation = () =>
    redirect(`/admin?locale=${locale}&error=validation&invalid=${encodeURIComponent(invalidFields.join(","))}`);

  const benefitsRaw = String(formData.get("benefitsJson") ?? "[]");
  const testimonialsRaw = String(formData.get("testimonialsText") ?? "");
  const faqsRaw = String(formData.get("faqsJson") ?? "[]");
  const howToRentStepsRaw = String(formData.get("howToRentStepsText") ?? "");
  const heroBadge = String(formData.get("heroBadge") ?? "").trim();
  const heroTitle = String(formData.get("heroTitle") ?? "").trim();
  const heroDescription = String(formData.get("heroDescription") ?? "").trim();
  const aboutSummary = String(formData.get("aboutSummary") ?? "").trim();
  const howToRentTitle = String(formData.get("howToRentTitle") ?? "").trim();
  const contactWhatsapp = String(formData.get("contactWhatsapp") ?? "").trim();
  const contactInstagram = String(formData.get("contactInstagram") ?? "").trim();
  const contactLocation = String(formData.get("contactLocation") ?? "").trim();

  if (!heroBadge) invalidFields.push("heroBadge");
  if (!heroTitle) invalidFields.push("heroTitle");
  if (!heroDescription) invalidFields.push("heroDescription");
  if (!aboutSummary) invalidFields.push("aboutSummary");
  if (!howToRentTitle) invalidFields.push("howToRentTitle");
  if (!contactWhatsapp) invalidFields.push("contactWhatsapp");
  if (!contactInstagram) invalidFields.push("contactInstagram");
  if (!contactLocation) invalidFields.push("contactLocation");

  let benefits: Array<{ title: string; description: string }> = [];
  let faqs: Array<{ q: string; a: string }> = [];

  try {
    const parsed = JSON.parse(benefitsRaw);
    if (!Array.isArray(parsed)) throw new Error("Benefits must be an array");
    benefits = parsed
      .map((item) => ({
        title: String(item?.title ?? "").trim(),
        description: String(item?.description ?? "").trim(),
      }))
      .filter((item) => item.title && item.description);
    if (!benefits.length) invalidFields.push("benefitsJson");
  } catch {
    invalidFields.push("benefitsJson");
  }

  const testimonials = testimonialsRaw
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const howToRentSteps = howToRentStepsRaw
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  if (!howToRentSteps.length) invalidFields.push("howToRentStepsText");

  try {
    const parsed = JSON.parse(faqsRaw);
    if (!Array.isArray(parsed)) throw new Error("FAQs must be an array");
    faqs = parsed
      .map((item) => ({
        q: String(item?.q ?? "").trim(),
        a: String(item?.a ?? "").trim(),
      }))
      .filter((item) => item.q && item.a);
    if (!faqs.length) invalidFields.push("faqsJson");
  } catch {
    invalidFields.push("faqsJson");
  }

  if (invalidFields.length) redirectValidation();

  const payload: SiteContent = {
    heroImage: String(formData.get("heroImage") ?? ""),
    logoImage: String(formData.get("logoImage") ?? ""),
    faviconImage: String(formData.get("faviconImage") ?? ""),
    heroBadge,
    heroTitle,
    heroDescription,
    aboutSummary,
    howToRentTitle,
    howToRentSteps,
    contact: {
      whatsapp: contactWhatsapp,
      instagram: contactInstagram,
      location: contactLocation,
    },
    benefits,
    testimonials,
    faqs,
  };

  const { error } = await supabase.from("site_content").upsert(
    {
      key: "site",
      locale,
      value: payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key,locale" },
  );
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/how-to-rent");
  revalidatePath("/admin");
  revalidatePath("/catalog");
  redirect(`/admin?saved=1&locale=${locale}`);
}

export async function saveProduct(formData: FormData) {
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") ?? "");
  const customId = String(formData.get("id") ?? "");
  const category = String(formData.get("category") ?? "").trim();
  const id = customId || slugify(name, { lower: true, strict: true });
  if (!id || !name || !category) throw new Error("Product id, name, and category are required");

  const photosJson = String(formData.get("photosJson") ?? "[]");
  const videosJson = String(formData.get("videosJson") ?? "[]");
  const pricesJson = String(formData.get("pricesJson") ?? "[]");
  const availabilityCalendarJson = String(formData.get("availabilityCalendarJson") ?? "[]");

  let prices: Array<{ label: string; amount: number }> = [];
  let photos: string[] = [];
  let videos: string[] = [];
  let availabilityCalendar: Array<
    | { mode?: "single"; date: string; status: "available" | "booked" }
    | { mode: "range"; startDate: string; endDate: string; status: "available" | "booked" }
  > = [];
  const photoFiles = formData
    .getAll("photoFiles")
    .filter((item): item is File => item instanceof File && item.size > 0);

  try {
    const parsed = JSON.parse(pricesJson);
    prices = Array.isArray(parsed)
      ? parsed
          .map((item) => ({ label: String(item?.label ?? "").trim(), amount: Number(item?.amount ?? 0) }))
          .filter((item) => item.label && item.amount > 0)
      : [];
  } catch {
    throw new Error("pricesJson must be valid JSON array");
  }

  try {
    const parsed = JSON.parse(photosJson);
    photos = Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
  } catch {
    throw new Error("photosJson must be valid JSON array");
  }

  if (photoFiles.length > 0) {
    const adminClient = createSupabaseAdminClient();
    const uploadedPhotos: string[] = [];

    for (const [index, file] of photoFiles.entries()) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${id}/${Date.now()}-${index}.${extension}`;
      const bytes = await file.arrayBuffer();
      const { error: uploadError } = await adminClient.storage.from("product-images").upload(path, bytes, {
        contentType: file.type,
        upsert: false,
      });
      if (uploadError) throw new Error(uploadError.message);
      const { data } = adminClient.storage.from("product-images").getPublicUrl(path);
      uploadedPhotos.push(data.publicUrl);
    }

    photos = [...photos, ...uploadedPhotos];
  }

  try {
    const parsed = JSON.parse(videosJson);
    videos = Array.isArray(parsed) ? parsed.map((item) => String(item).trim()).filter(Boolean) : [];
  } catch {
    throw new Error("videosJson must be valid JSON array");
  }

  const features = String(formData.get("features") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  try {
    const parsed = JSON.parse(availabilityCalendarJson);
    availabilityCalendar = Array.isArray(parsed)
      ? parsed
          .map((item) => {
            const status: "available" | "booked" = item?.status === "booked" ? "booked" : "available";
            const mode = item?.mode === "range" ? "range" : "single";
            if (mode === "range") {
              return {
                mode: "range" as const,
                startDate: String(item?.startDate ?? ""),
                endDate: String(item?.endDate ?? ""),
                status,
              };
            }
            return {
              mode: "single" as const,
              date: String(item?.date ?? ""),
              status,
            };
          })
          .filter((item) => ("date" in item ? item.date : item.startDate && item.endDate))
      : [];
  } catch {
    throw new Error("availabilityCalendarJson must be valid JSON array");
  }

  const weeklyPrice =
    prices.find((item) => item.label.toLowerCase() === "weekly")?.amount ??
    prices[0]?.amount ??
    Number(formData.get("weeklyPrice") ?? 0);
  const monthlyPrice =
    prices.find((item) => item.label.toLowerCase() === "monthly")?.amount ??
    prices[1]?.amount ??
    Number(formData.get("monthlyPrice") ?? 0);

  const { error } = await supabase.from("products").upsert(
    {
      id,
      name,
      category,
      brand: String(formData.get("brand") ?? ""),
      weekly_price: weeklyPrice,
      monthly_price: monthlyPrice,
      price_options: prices,
      description: String(formData.get("description") ?? ""),
      features,
      age_range: String(formData.get("ageRange") ?? ""),
      weight_capacity: String(formData.get("weightCapacity") ?? ""),
      dimensions: String(formData.get("dimensions") ?? ""),
      availability: formData.get("availability") === "on",
      featured: formData.get("featured") === "on",
      availability_last_updated: String(formData.get("availabilityLastUpdated") ?? new Date().toISOString().slice(0, 10)),
      availability_calendar: availabilityCalendar,
      photos,
      videos,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(error.message);

  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath(`/product/${id}`);
  revalidatePath("/admin");
  redirect("/admin/products?savedProduct=1");
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing product id");
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/admin");
  redirect("/admin/products?deleted=1");
}

export async function uploadProductImage(formData: FormData) {
  await requireAdmin();
  const productId = String(formData.get("productId") ?? "").trim();
  const file = formData.get("image") as File | null;
  if (!productId || !file) throw new Error("productId and image file are required");

  const adminClient = createSupabaseAdminClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${productId}/${Date.now()}.${extension}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await adminClient.storage.from("product-images").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw new Error(uploadError.message);

  const { data } = adminClient.storage.from("product-images").getPublicUrl(path);

  const supabase = await createSupabaseServerClient();
  const { data: product } = await supabase.from("products").select("photos").eq("id", productId).maybeSingle();
  const nextPhotos = [...(product?.photos ?? []), data.publicUrl];
  const { error: updateError } = await supabase
    .from("products")
    .update({ photos: nextPhotos, updated_at: new Date().toISOString() })
    .eq("id", productId);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/admin");
  revalidatePath(`/product/${productId}`);
  revalidatePath("/catalog");
  const redirectTo = String(formData.get("redirectTo") ?? `/admin/products/${productId}/edit`);
  redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}uploaded=1`);
}

export async function uploadSiteAsset(formData: FormData) {
  await requireAdmin();
  const assetType = String(formData.get("assetType") ?? "");
  const file = formData.get("image") as File | null;
  if (!file) throw new Error("Image file is required");
  if (!["heroImage", "logoImage", "faviconImage"].includes(assetType)) {
    throw new Error("Invalid asset type");
  }

  const adminClient = createSupabaseAdminClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `${assetType}/${Date.now()}.${extension}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await adminClient.storage.from("site-assets").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw new Error(uploadError.message);

  const { data } = adminClient.storage.from("site-assets").getPublicUrl(path);
  const publicUrl = data.publicUrl;

  const supabase = await createSupabaseServerClient();
  const locales: Locale[] = ["id", "en"];
  for (const locale of locales) {
    const { data: row } = await supabase.from("site_content").select("value").eq("key", "site").eq("locale", locale).maybeSingle();
    const value = (row?.value ?? {}) as Partial<SiteContent>;
    const nextValue = {
      ...value,
      [assetType]: publicUrl,
    } as SiteContent;

    const { error } = await supabase.from("site_content").upsert(
      {
        key: "site",
        locale,
        value: nextValue,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key,locale" },
    );
    if (error) throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/about");
  revalidatePath("/catalog");
  redirect(`/admin?section=content&assetUpdated=1&type=${assetType}`);
}
