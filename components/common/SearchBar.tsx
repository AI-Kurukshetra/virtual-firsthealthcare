"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  basePath?: string;
  showButton?: boolean;
  buttonLabel?: string;
};

export function SearchBar({
  placeholder,
  className,
  inputClassName,
  buttonClassName,
  basePath,
  showButton = true,
  buttonLabel = "Search"
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState("");

  const currentQuery = useMemo(() => searchParams.get("q") ?? "", [searchParams]);

  useEffect(() => {
    setValue(currentQuery);
  }, [currentQuery]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams(searchParams.toString());
    const trimmed = value.trim();

    if (trimmed) {
      params.set("q", trimmed);
      params.set("page", "1");
    } else {
      params.delete("q");
      params.set("page", "1");
    }

    const targetPath = basePath ?? pathname;
    const queryString = params.toString();
    router.replace(queryString ? `${targetPath}?${queryString}` : targetPath);
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex w-full items-center gap-2 md:w-auto", className)}>
      <Input
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className={cn("h-9 md:w-56", inputClassName)}
      />
      {showButton ? (
        <Button size="sm" type="submit" className={buttonClassName}>
          {buttonLabel}
        </Button>
      ) : null}
    </form>
  );
}
