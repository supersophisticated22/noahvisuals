import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePage } from "@/components/service-page";
import { getServiceBySlug } from "@/lib/content";

const SLUG = "social-media-content";

export async function generateMetadata(): Promise<Metadata> {
  const service = await getServiceBySlug(SLUG);
  return {
    title: service ? `${service.title} | Noah Visuals` : "Noah Visuals",
    description: service?.description,
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  const { preview } = await searchParams;
  const service = await getServiceBySlug(SLUG, preview === "true");
  if (!service) notFound();
  return <ServicePage service={service} />;
}
