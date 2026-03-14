"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const actions = [
  { label: "Go to Dashboard", href: "/dashboard" },
  { label: "Patients", href: "/patients" },
  { label: "Providers", href: "/providers" },
  { label: "Appointments", href: "/appointments" },
  { label: "Medical Records", href: "/medical-records" },
  { label: "Prescriptions", href: "/prescriptions" },
  { label: "Documents", href: "/documents" },
  { label: "Messaging", href: "/messaging" },
  { label: "Notifications", href: "/notifications" },
  { label: "Settings", href: "/settings" }
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const onKeyDown = useCallback((event: KeyboardEvent) => {
    const isCmdK = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    if (isCmdK) {
      event.preventDefault();
      setOpen((value) => !value);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  const filtered = useMemo(() => {
    const term = query.toLowerCase().trim();
    if (!term) return actions;
    return actions.filter((action) => action.label.toLowerCase().includes(term));
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Command Palette</DialogTitle>
          <DialogDescription>Jump to anything in the platform.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-3 py-2">
          <Search className="h-4 w-4 text-foreground/50" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search features or pages"
            className="h-8 border-none bg-transparent px-0 text-sm focus-visible:ring-0"
          />
        </div>
        <div className="max-h-64 space-y-2 overflow-auto">
          {filtered.length === 0 ? (
            <p className="text-sm text-foreground/60">No results.</p>
          ) : (
            filtered.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-sm text-foreground/80 transition hover:bg-card/70"
                onClick={() => setOpen(false)}
              >
                <span>{action.label}</span>
                <span className="text-xs text-foreground/40">Open</span>
              </Link>
            ))
          )}
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/40">Press ⌘ + K anytime</p>
      </DialogContent>
    </Dialog>
  );
}
