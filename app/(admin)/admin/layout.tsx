import { AdminNav } from "@/components/admin/admin-nav";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 shrink-0 border-r border-border/60 bg-card/40">
        <AdminNav />
      </aside>
      <div className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-5xl px-6 py-10">{children}</div>
      </div>
    </div>
  );
}
