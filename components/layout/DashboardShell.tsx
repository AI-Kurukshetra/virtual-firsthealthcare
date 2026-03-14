import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export function DashboardShell({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen px-6 pb-10 pt-6">
      <div className="mx-auto flex max-w-7xl gap-6">
        <Sidebar />
        <div className="flex w-full flex-1 flex-col gap-6">
          <Topbar />
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.4em] text-white/40">
              {description ?? "Operations"}
            </p>
            <h2 className="text-3xl font-semibold text-white">{title}</h2>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
