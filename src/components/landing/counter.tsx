import { animate, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

export function Counter({ to, decimals = 0, duration = 1.8 }: { to: number; decimals?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, to, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, to, duration, mv]);

  useEffect(() => {
    return rounded.on("change", (v) => {
      if (ref.current) ref.current.textContent = v;
    });
  }, [rounded]);

  return <span ref={ref}>0</span>;
}
