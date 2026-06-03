import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Reveal } from "./reveal";

const faqs = [
  {
    q: "How long does it take to set up EduFlow?",
    a: "Most schools are fully operational within a single afternoon. CSV import for students and one-click teacher invites take care of the heavy lifting.",
  },
  {
    q: "Can I manage multiple schools from one account?",
    a: "Yes. EduFlow is built multi-school from the ground up. Each school operates independently with its own teachers, students, and analytics.",
  },
  {
    q: "Is student data secure?",
    a: "Absolutely. All data is encrypted at rest and in transit. We are GDPR and FERPA aligned, with role-based access for every record.",
  },
  {
    q: "Do teachers need training to use it?",
    a: "No formal training required. The interface is intentionally simple — most teachers are comfortable in under 10 minutes.",
  },
  {
    q: "Can I export reports?",
    a: "Every report exports to PDF and CSV. White-label PDFs with your school's branding are included on every plan.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="relative py-28 bg-surface/40 border-y border-border">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal variant="blur" className="text-center">
          <div className="text-xs uppercase tracking-[0.18em] text-accent font-medium">FAQ</div>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold tracking-tight">
            Questions, answered.
          </h2>
        </Reveal>

        <div className="mt-12 space-y-2.5">
          {faqs.map((f, i) => (
            <Reveal key={f.q} variant="up" delay={i * 0.05}>
              <FAQItem {...f} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-secondary/50 transition-colors"
      >
        <span className="font-medium text-[15px]">{q}</span>
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.3 }}>
          <Plus className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
