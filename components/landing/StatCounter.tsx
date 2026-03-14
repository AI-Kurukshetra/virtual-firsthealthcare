"use client";

import { useEffect, useState } from "react";

type StatCounterProps = {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
};

export function StatCounter({
  value,
  duration = 1200,
  prefix = "",
  suffix = "",
  className
}: StatCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      const timeoutId = window.setTimeout(() => setDisplayValue(value), 0);
      return () => window.clearTimeout(timeoutId);
    }

    let start: number | null = null;
    const max = Math.max(0, value);

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const next = Math.floor(progress * max);
      setDisplayValue(next);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [duration, value]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
