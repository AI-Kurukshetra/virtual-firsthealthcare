import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

export function MetricCard({
  title,
  value,
  change,
  icon
}: {
  title: string;
  value: string;
  change: string;
  icon: ReactNode;
}) {
  return (
    <Card className="flex items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">{title}</p>
        <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
        <p className="mt-1 text-xs text-foreground/50">{change}</p>
      </div>
      <div className="rounded-2xl border border-border/60 bg-card/60 p-3 text-accent">
        {icon}
      </div>
    </Card>
  );
}
