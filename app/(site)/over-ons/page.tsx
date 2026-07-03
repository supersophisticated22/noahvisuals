import type { Metadata } from "next";
import Image from "next/image";
import { getPages } from "@/lib/content";

export const metadata: Metadata = {
  title: "Over Ons | Noah Visuals",
  description:
    "Noah Visuals helpt bedrijven, merken en ondernemers om professioneel zichtbaar te worden met hoogwaardige fotografie, video en social media content.",
};

export default async function OverOnsPage() {
  const { process } = await getPages();
  return (
    <>
      <section className="relative flex h-[60vh] min-h-[380px] items-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80&auto=format&fit=crop"
          alt="Het team van Noah Visuals aan het werk tijdens een productie"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/0" />
        <div className="relative mx-auto w-full max-w-7xl px-6 pb-16 md:px-10">
          <h1 className="font-serif text-4xl font-semibold text-foreground md:text-6xl">
            Over Ons
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center md:px-10">
        <p className="text-lg leading-relaxed text-muted-foreground">
          Noah Visuals helpt bedrijven, merken en ondernemers om
          professioneel zichtbaar te worden met hoogwaardige fotografie,
          video en social media content. Wij combineren een oog voor detail
          met een cinematische visie, zodat elk beeld bijdraagt aan hoe jouw
          merk wordt waargenomen.
        </p>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Van het eerste kennismakingsgesprek tot de definitieve oplevering:
          wij denken mee, werken nauwkeurig en leveren beeldmateriaal waar je
          jarenlang plezier van hebt.
        </p>
      </section>

      <section className="border-t border-border/60 bg-card/40 py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <h2 className="text-center font-serif text-3xl font-semibold text-foreground md:text-5xl">
            Hoe wij werken
          </h2>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-4">
            {process.map((step) => (
              <div key={step.step} className="relative">
                <span className="font-serif text-4xl font-semibold text-accent">
                  {step.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
