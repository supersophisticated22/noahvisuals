import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Service } from "@/lib/site-data";

export function ServicePage({ service }: { service: Service }) {
  return (
    <>
      <section className="relative flex h-[70vh] min-h-[420px] items-end overflow-hidden">
        <Image
          src={service.image}
          alt={`${service.title} door Noah Visuals`}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/0" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-16 md:px-10">
          <h1 className="font-serif text-4xl font-semibold text-foreground md:text-6xl">
            {service.title}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            {service.tagline}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center md:px-10">
        <p className="text-lg leading-relaxed text-muted-foreground">
          {service.longDescription}
        </p>
      </section>

      <section className="border-t border-border/60 bg-card/40 py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {service.gallery.map((src) => (
              <div
                key={src}
                className="relative aspect-[4/5] overflow-hidden rounded-2xl"
              >
                <Image
                  src={src}
                  alt={`Voorbeeldwerk ${service.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-24 text-center md:px-10">
        <h2 className="font-serif text-3xl font-semibold text-foreground md:text-5xl">
          Klaar om je merk premium in beeld te brengen?
        </h2>
        <Button
          render={<Link href="/contact" />}
          size="lg"
          className="mt-8 cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
        >
          Plan een kennismaking
        </Button>
      </section>
    </>
  );
}
