"use client";

import { cn } from "@manovaspace/ui";
import type { ReactNode } from "react";

export interface NavRailProps {
  children?: ReactNode;
  isLoading?: boolean;
  brand?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

const navRailAsideClass =
  "hidden min-h-0 w-60 shrink-0 flex-col border-e border-border bg-sidebar text-sidebar-foreground md:flex";

export function NavRail({ children, isLoading = false, brand, footer, className }: NavRailProps) {
  if (isLoading) {
    return (
      <aside
        className={cn(navRailAsideClass, className)}
        aria-busy="true"
        data-testid="nav-rail-skeleton"
      >
        {brand ? <div className="shrink-0 p-3">{brand}</div> : null}
        <div className="flex min-h-0 flex-1 flex-col space-y-2 overflow-y-auto overscroll-contain p-3">
          <div className="h-9 rounded-md bg-muted/50" aria-hidden />
          <div className="h-9 rounded-md bg-muted/50" aria-hidden />
          <div className="h-9 rounded-md bg-muted/50" aria-hidden />
        </div>
        {footer ? <div className="shrink-0 space-y-2 p-3 empty:hidden">{footer}</div> : null}
      </aside>
    );
  }

  return (
    <aside className={cn(navRailAsideClass, className)}>
      {brand ? <div className="shrink-0 p-3">{brand}</div> : null}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-2 scroll-pb-16">
        {children}
      </div>
      {footer ? <div className="shrink-0 space-y-2 p-3 empty:hidden">{footer}</div> : null}
    </aside>
  );
}
