import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact | Noah Visuals",
  description:
    "Plan een kennismaking met Noah Visuals voor premium fotografie en videografie.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-24 md:px-10">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-serif text-4xl font-semibold text-foreground md:text-6xl">
          Contact
        </h1>
        <p className="mt-4 text-muted-foreground">
          Plan een vrijblijvende kennismaking en ontdek wat Noah Visuals voor
          jouw merk kan betekenen.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-16 md:grid-cols-2">
        <ContactForm />

        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <Mail className="mt-1 size-5 text-accent" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">E-mail</p>
              <a
                href="mailto:hello@noahvisuals.nl"
                className="cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-accent"
              >
                hello@noahvisuals.nl
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="mt-1 size-5 text-accent" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">Telefoon</p>
              <a
                href="tel:+31612345678"
                className="cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-accent"
              >
                +31 6 12 34 56 78
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="mt-1 size-5 text-accent" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">Studio</p>
              <p className="text-muted-foreground">Amsterdam, Nederland</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
