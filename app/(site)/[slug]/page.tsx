import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCustomPageBySlug } from "@/lib/content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getCustomPageBySlug(slug);
  if (!page) return {};
  return {
    title: page.seo.title || `${page.title} | Noah Visuals`,
    description: page.seo.description || undefined,
  };
}

export default async function CustomPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";

  const page = await getCustomPageBySlug(slug, isPreview);
  if (!page || (!page.visible && !isPreview)) notFound();

  return (
    <article className="py-4">
      <div dangerouslySetInnerHTML={{ __html: page.html }} />
    </article>
  );
}
