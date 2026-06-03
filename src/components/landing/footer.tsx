import { GraduationCap } from "lucide-react";

const cols = [
  { title: "Product", links: ["Features", "Analytics", "Reports", "Pricing", "Changelog"] },
  { title: "Company", links: ["About", "Careers", "Customers", "Contact"] },
  { title: "Resources", links: ["Docs", "Help center", "Guides", "API"] },
  { title: "Legal", links: ["Privacy", "Terms", "Security", "DPA"] },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 grid grid-cols-2 md:grid-cols-6 gap-10">
        <div className="col-span-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-hero grid place-items-center">
              <GraduationCap className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display font-semibold tracking-tight">EduFlow</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            The modern operating system for schools. Built for administrators, teachers, and students.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <div className="text-xs font-medium uppercase tracking-wider text-foreground">{c.title}</div>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© 2026 EduFlow Inc. All rights reserved.</div>
          <div>Made for modern schools.</div>
        </div>
      </div>
    </footer>
  );
}
