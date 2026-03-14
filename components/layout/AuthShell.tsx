import { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  children
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(91,156,255,0.2),_transparent_60%)]" />
      <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-accent/20 blur-[120px]" />
      <div className="relative mx-auto flex max-w-5xl flex-col gap-10">
        <div className="glass noise rounded-[36px] border border-border/60 p-10">
          <p className="text-xs uppercase tracking-[0.4em] text-foreground/40">
            Virtual Health Platform
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-foreground/60">{subtitle}</p>
          <div className="mt-8 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
            <div>{children}</div>
            <div className="flex flex-col justify-between rounded-[28px] border border-border/60 bg-card/60 p-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.4em] text-foreground/40">
                  Platform Snapshot
                </p>
                <p className="text-lg text-foreground">
                  Secure telehealth, EHR, and billing under one compliant workspace.
                </p>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm text-foreground/70">
                  <span>Active providers</span>
                  <span className="text-foreground">148</span>
                </div>
                <div className="flex items-center justify-between text-sm text-foreground/70">
                  <span>Patients onboarded</span>
                  <span className="text-foreground">2,934</span>
                </div>
                <div className="flex items-center justify-between text-sm text-foreground/70">
                  <span>Appointments today</span>
                  <span className="text-foreground">216</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
