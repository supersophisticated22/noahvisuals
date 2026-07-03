import Image from "next/image";
import Link from "next/link";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { serviceIcons } from "@/lib/site-data";
import { getVisibleServices, getPages } from "@/lib/content";

const portfolioImages = [
  "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=1200&q=80&auto=format&fit=crop",
];

export default async function Home() {
  const [services, pages] = await Promise.all([
    getVisibleServices(),
    getPages(),
  ]);
  const { hero, about, process } = pages;

  return (
    <>
      {/* Hero */}
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center gap-6">
            <h1 className="font-serif text-5xl font-semibold tracking-tight text-foreground md:text-8xl">
              {hero.headline}
            </h1>
            <p className="max-w-2xl text-balance text-base text-muted-foreground md:text-xl">
              {hero.tagline}
            </p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <Button
                render={<Link href={hero.cta_url} />}
                size="lg"
                className="cursor-pointer bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {hero.cta_label}
              </Button>
              <Button
                render={<Link href="/contact" />}
                size="lg"
                variant="outline"
                className="cursor-pointer border-border text-foreground hover:bg-secondary hover:text-accent"
              >
                Neem contact op
              </Button>
            </div>
          </div>
        }
      >
        <Image
          src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1600&q=80&auto=format&fit=crop"
          alt="Professionele camera-apparatuur klaar voor een cinematische shoot"
          height={720}
          width={1400}
          className="mx-auto h-full rounded-2xl object-cover object-center"
          priority
          draggable={false}
        />
      </ContainerScroll>

      {/* Services */}
      <section id="diensten" className="mx-auto max-w-7xl px-6 py-24 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-serif text-3xl font-semibold text-foreground md:text-5xl">
            Onze diensten
          </h2>
          <p className="mt-4 text-muted-foreground">
            Van bedrijfsportret tot dronebeeld — één studio voor al je
            visuele content.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = serviceIcons[service.icon];
            return (
              <Link key={service.slug} href={`/${service.slug}`}>
                <Card className="group h-full cursor-pointer border-border bg-card transition-colors duration-200 hover:border-accent/60">
                  <CardHeader>
                    <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-accent">
                      <Icon className="size-6" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <CardTitle className="mt-4 font-serif text-xl">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <span className="text-sm font-medium text-accent transition-colors duration-200 group-hover:underline">
                      Meer weten &rarr;
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Portfolio preview */}
      <section className="border-t border-border/60 bg-card/40 py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <h2 className="max-w-xl font-serif text-3xl font-semibold text-foreground md:text-5xl">
            Visuele verhalen met impact.
          </h2>

          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-6 md:gap-4">
            {portfolioImages.map((src, i) => (
              <div
                key={src}
                className={`relative overflow-hidden rounded-xl ${
                  i === 0 || i === 3 ? "col-span-2 aspect-square" : "aspect-[3/4]"
                }`}
              >
                <Image
                  src={src}
                  alt="Cinematisch beeld uit een Noah Visuals productie"
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center md:px-10">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
          <Image
            src={
              about.photo ||
              "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&q=80&auto=format&fit=crop"
            }
            alt="Team van Noah Visuals in gesprek tijdens een productie"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="font-serif text-3xl font-semibold text-foreground md:text-5xl">
            {about.heading}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {about.body}
          </p>
          <Button
            render={<Link href="/over-ons" />}
            variant="outline"
            className="mt-8 cursor-pointer border-border text-foreground hover:bg-secondary hover:text-accent"
          >
            Meer over ons
          </Button>
        </div>
      </section>

      {/* Process */}
      <section className="border-t border-border/60 bg-card/40 py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <h2 className="text-center font-serif text-3xl font-semibold text-foreground md:text-5xl">
            Ons proces
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

      {/* Contact CTA */}
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
