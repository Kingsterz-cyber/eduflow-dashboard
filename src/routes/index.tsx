import { createFileRoute } from "@tanstack/react-router";
import { ThemeProvider } from "@/components/landing/theme-provider";
import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { SocialProof } from "@/components/landing/social-proof";
import { Features } from "@/components/landing/features";
import { AnalyticsSection } from "@/components/landing/analytics-section";
import { Roles } from "@/components/landing/roles";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CTA } from "@/components/landing/cta";
import { Footer } from "@/components/landing/footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EduFlow — Manage your entire school from one intelligent platform" },
      {
        name: "description",
        content:
          "EduFlow is the modern multi-school management platform. Track attendance, manage students, record marks, generate reports, and get real-time analytics.",
      },
      { property: "og:title", content: "EduFlow — Modern school management" },
      {
        property: "og:description",
        content:
          "Track attendance, manage students, record marks, generate reports, and get real-time analytics — from one beautifully crafted platform.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-foreground antialiased overflow-x-hidden">
        <Navbar />
        <main>
          <Hero />
          <SocialProof />
          <Features />
          <AnalyticsSection />
          <Roles />
          <HowItWorks />
          <Testimonials />
          <FAQ />
          <CTA />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}
