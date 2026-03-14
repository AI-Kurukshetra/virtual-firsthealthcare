"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export type FilterOption = {
  label: string;
  value: string;
};

type FilterSelectProps = {
  param: string;
  label?: string;
  options: FilterOption[];
  basePath?: string;
  className?: string;
};

export function FilterSelect({ param, label, options, basePath, className }: FilterSelectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentValue = useMemo(() => searchParams.get(param) ?? "", [param, searchParams]);

  function handleChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) {
      params.set(param, next);
      params.set("page", "1");
    } else {
      params.delete(param);
      params.set("page", "1");
    }
    const targetPath = basePath ?? pathname;
    const queryString = params.toString();
    router.replace(queryString ? `${targetPath}?${queryString}` : targetPath);
  }

  return (
    <label className={cn("flex items-center gap-2 text-xs text-foreground/60", className)}>
      {label ? <span className="uppercase tracking-[0.3em]">{label}</span> : null}
      <select
        value={currentValue}
        onChange={(event) => handleChange(event.target.value)}
        className="h-9 rounded-full border border-border/60 bg-card/60 px-3 text-xs uppercase tracking-[0.2em] text-foreground"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
