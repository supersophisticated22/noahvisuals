import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getVisibleServices, getPages, getVisibleCustomPages } from "@/lib/content";
import { buildNavLinks, customPageNavLinks } from "@/lib/site-data";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [services, pages, customPages] = await Promise.all([
    getVisibleServices(),
    getPages(),
    getVisibleCustomPages(),
  ]);
  const navPages = customPageNavLinks(customPages);
  const navLinks = buildNavLinks(services, customPages);

  return (
    <>
      <SiteHeader services={services} pages={navPages} />
      <main className="flex-1">{children}</main>
      <SiteFooter navLinks={navLinks} contact={pages.contact} />
    </>
  );
}
