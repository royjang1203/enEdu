"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_LEVELS = ["all", "A1", "A2", "B1", "B2"] as const;

export function LevelFilter({ label, levels }: { label: string; levels?: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("level") ?? "all";
  const options = levels && levels.length > 0 ? levels : DEFAULT_LEVELS;

  const onValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("level");
    } else {
      params.set("level", value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <Select value={current} onValueChange={onValueChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All levels" />
        </SelectTrigger>
        <SelectContent>
          {options.map((level) => (
            <SelectItem key={level} value={level}>
              {level === "all" ? "All" : level}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
