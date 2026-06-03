import { Reveal } from "./reveal";
import { Counter } from "./counter";

const stats = [
  { label: "Schools using EduFlow", value: 1240, suffix: "+" },
  { label: "Students managed", value: 480000, suffix: "+" },
  { label: "Teachers supported", value: 32000, suffix: "+" },
  { label: "Reports generated", value: 2.4, suffix: "M", decimals: 1 },
];

export function SocialProof() {
  return (
    <section className="relative py-20 border-y border-border bg-surface/50">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal variant="up" className="text-center">
          <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            Trusted by modern schools worldwide
          </div>
        </Reveal>
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <Reveal key={s.label} variant="up" delay={i * 0.08} className="text-center">
              <div className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-gradient">
                <Counter to={s.value} decimals={s.decimals ?? 0} />
                {s.suffix}
              </div>
              <div className="mt-1.5 text-sm text-muted-foreground">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
