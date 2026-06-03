import { motion } from "framer-motion";
import { GraduationCap, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

const links = [
  { label: "Features", href: "#features" },
  { label: "Analytics", href: "#analytics" },
  { label: "Roles", href: "#roles" },
  { label: "How it works", href: "#how" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1180px,calc(100%-2rem))]"
    >
      <div className="glass rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between shadow-card">
        <a href="#" className="flex items-center gap-2 group">
          <div className="relative h-8 w-8 rounded-lg bg-gradient-hero grid place-items-center shadow-glow-primary">
            <GraduationCap className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display font-semibold tracking-tight text-base">EduFlow</span>
        </a>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="h-9 w-9 grid place-items-center rounded-lg hover:bg-secondary transition-colors"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.35 }}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </motion.div>
          </button>
          <a
            href="#cta"
            className="hidden sm:inline-flex h-9 items-center px-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </a>
          <motion.a
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            href="#cta"
            className="inline-flex h-9 items-center gap-1.5 px-4 rounded-lg bg-foreground text-background text-sm font-medium shadow-card hover:shadow-elevated transition-shadow"
          >
            Start Free
          </motion.a>
        </div>
      </div>
    </motion.header>
  );
}
