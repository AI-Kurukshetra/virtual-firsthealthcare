import Image from "next/image";
import { CalendarClock, FileText, MessageSquareText, Stethoscope } from "lucide-react";

export function HeroPreview() {
  return (
    <div className="glass noise relative overflow-hidden rounded-[32px] border border-border/60 p-6 shadow-glass">
      <Image
        src="/hero-preview.svg"
        alt=""
        width={520}
        height={420}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        priority
      />
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/30 blur-2xl" />
      <div className="absolute -bottom-10 left-10 h-28 w-28 rounded-full bg-accent/20 blur-3xl" />
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-foreground/40">
        <span>Care operations</span>
        <span className="rounded-full border border-border/70 px-2 py-1 text-[10px]">Live</span>
      </div>
      <div className="mt-6 grid gap-4">
        <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/60 px-4 py-3">
          <div>
            <p className="text-xs text-foreground/50">Next appointment</p>
            <p className="text-sm font-semibold text-foreground">09:30 AM · Maya Patel</p>
          </div>
          <span className="rounded-full border border-border/80 px-3 py-1 text-xs text-foreground/70">
            Telehealth
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
            <div className="flex items-center gap-2 text-xs text-foreground/50">
              <Stethoscope className="h-4 w-4 text-accent" />
              Active providers
            </div>
            <p className="mt-2 text-2xl font-semibold">112</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
            <div className="flex items-center gap-2 text-xs text-foreground/50">
              <MessageSquareText className="h-4 w-4 text-accent" />
              New messages
            </div>
            <p className="mt-2 text-2xl font-semibold">14</p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-primary/20 via-background/30 to-accent/20 p-4">
          <div className="flex items-center justify-between text-xs text-foreground/60">
            <span className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4" />
              Today
            </span>
            <span>38 patients</span>
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-foreground/60">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Records updated
              </span>
              <span>24</span>
            </div>
            <div className="h-2 rounded-full bg-card/70">
              <div className="h-full w-3/4 rounded-full bg-primary/70" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
