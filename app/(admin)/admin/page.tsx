import Link from "next/link";
import { CheckCircle2, CircleAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getServices, hasUnpublishedChanges } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [services, dirty] = await Promise.all([
    getServices(),
    hasUnpublishedChanges(),
  ]);
  const visible = services.filter((s) => s.visible).length;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Beheer de content van de Noah Visuals website.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Diensten</CardDescription>
            <CardTitle className="text-3xl">{services.length}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {visible} zichtbaar op de site
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Publicatiestatus</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl">
              {dirty ? (
                <>
                  <CircleAlert className="size-5 text-amber-500" />
                  Wijzigingen
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-5 text-emerald-500" />
                  Gepubliceerd
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {dirty
              ? "Er zijn niet-gepubliceerde wijzigingen in de concept-versie."
              : "Concept en gepubliceerde versie zijn gelijk."}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          render={<Link href="/admin/services" />}
          className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Diensten beheren
        </Button>
        <Button render={<Link href="/admin/pages" />} variant="outline" className="cursor-pointer">
          Pagina&apos;s bewerken
        </Button>
        <Button render={<Link href="/admin/settings" />} variant="outline" className="cursor-pointer">
          Publiceren &amp; versies
        </Button>
      </div>
    </div>
  );
}
