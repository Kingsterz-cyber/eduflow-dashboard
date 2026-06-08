import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, GraduationCap, UserCog, ArrowRight, Sparkles, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMe } from "@/hooks/use-me";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Get started · EduFlow" }] }),
  component: OnboardingHome,
});

function OnboardingHome() {
  const me = useMe();
  const navigate = useNavigate();
  const [choice, setChoice] = useState<"director" | "teacher" | "student" | null>(null);

  useEffect(() => {
    if (me.loading) return;
    if (!me.session) navigate({ to: "/auth" });
    else if (me.role) navigate({ to: "/app" });
  }, [me.loading, me.session, me.role, navigate]);

  if (me.loading || !me.session) return null;

  const options = [
    {
      id: "director" as const,
      icon: Building2,
      title: "I'm a School Director",
      desc: "Create a new school workspace and invite your team.",
      to: "/onboarding/school" as const,
    },
    {
      id: "teacher" as const,
      icon: UserCog,
      title: "I'm a Teacher",
      desc: "Join my school using my school's teacher registration code.",
      to: "/onboarding/teacher" as const,
    },
    {
      id: "student" as const,
      icon: GraduationCap,
      title: "I'm a Student",
      desc: "Join my class using my enrollment code.",
      to: "/onboarding/student" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <div className="h-8 w-8 rounded-lg bg-gradient-hero grid place-items-center text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            EduFlow
          </Link>
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/auth" }))}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-12">
          <h1 className="text-3xl font-semibold tracking-tight">Welcome to EduFlow</h1>
          <p className="mt-2 text-muted-foreground">Tell us how you'll use the platform. You can only choose one role per account.</p>

          <div className="mt-8 grid gap-3">
            {options.map((o, i) => {
              const Icon = o.icon;
              const active = choice === o.id;
              return (
                <motion.button
                  key={o.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setChoice(o.id)}
                  className={`text-left w-full p-5 rounded-2xl border transition flex items-center gap-4 ${
                    active
                      ? "border-foreground/40 bg-secondary/40 ring-2 ring-ring/20"
                      : "border-border bg-card hover:bg-secondary/30"
                  }`}
                >
                  <div className="h-11 w-11 rounded-xl bg-gradient-hero grid place-items-center text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{o.title}</div>
                    <div className="text-sm text-muted-foreground">{o.desc}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </motion.button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              disabled={!choice}
              onClick={() => choice && navigate({ to: options.find((o) => o.id === choice)!.to })}
              className="h-10 px-5 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-40 transition"
            >
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
