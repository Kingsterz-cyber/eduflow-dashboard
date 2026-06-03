import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Reveal, StaggerChildren, childVariant } from "./reveal";

const items = [
  {
    quote:
      "EduFlow replaced four tools we were duct-taping together. Our admin team got Fridays back.",
    name: "Priya Nair",
    role: "Director, Bright Horizons Academy",
  },
  {
    quote:
      "The analytics caught a pattern of falling attendance in 9-B before we did. Genuinely impressive.",
    name: "Marcus Holm",
    role: "Principal, Northgate International",
  },
  {
    quote:
      "Teachers actually use it. That's the highest compliment I can give a school platform.",
    name: "Elena Ruiz",
    role: "Vice Principal, St. Aurelia",
  },
  {
    quote:
      "Term reports went from a two-week project to a Tuesday afternoon. Parents love them too.",
    name: "Daniel Okafor",
    role: "Admin Lead, Riverside Schools",
  },
  {
    quote:
      "Beautiful interface, serious power underneath. Our IT team approved it on the first demo.",
    name: "Sara Lindqvist",
    role: "Director, Nordic Prep",
  },
  {
    quote:
      "Onboarded 12 teachers in an afternoon. Setup was almost unfairly easy.",
    name: "Tomás Vega",
    role: "Founder, Atelier School",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal variant="blur" className="text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-[0.18em] text-accent font-medium">Testimonials</div>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold tracking-tight">
            Loved by the people who run schools.
          </h2>
        </Reveal>

        <StaggerChildren className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <motion.div key={t.name} variants={childVariant}>
              <motion.div
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-border bg-card p-6 h-full shadow-card hover:shadow-elevated transition-shadow"
              >
                <div className="flex gap-0.5 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed">{t.quote}</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-gradient-hero" />
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
