"use client";

import { Button, cn, iconProps } from "@manovaspace/ui";
import type { ReactNode } from "react";
import { useState } from "react";
import { Bars3Icon } from "../../icons";

export type ShellHeaderVariant = "primary" | "default" | "brand";

export interface ShellHeaderProps {
  label?: ReactNode;
  title: ReactNode;
  openMenuLabel?: string;
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
  menuSheetId?: string;
  menuSheet?: ReactNode;
  isLoading?: boolean;
  variant?: ShellHeaderVariant;
  brandMark?: ReactNode;
  headerActions?: ReactNode;
  userCard?: ReactNode;
  className?: string;
}

export function ShellHeader({
  label,
  title,
  openMenuLabel = "Open menu",
  menuOpen = false,
  onMenuOpenChange,
  menuSheetId,
  menuSheet,
  isLoading = false,
  variant = "primary",
  brandMark,
  headerActions,
  userCard,
  className,
}: ShellHeaderProps) {
  const isDefault = variant === "default";
  const headerBg = isDefault
    ? "bg-background text-foreground border-b border-border"
    : "bg-primary text-primary-foreground";
  const subTitleText = isDefault ? "text-muted-foreground" : "text-primary-foreground/80";
  const skeletonBg = isDefault ? "bg-muted" : "bg-primary-foreground/20";
  const buttonClass = isDefault
    ? "border-border text-foreground hover:bg-muted"
    : "border-primary-foreground/45 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground";

  return (
    <>
      <header className={cn(headerBg, className)}>
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            {brandMark ? (
              <div className="shrink-0" aria-hidden={isLoading}>
                {isLoading ? (
                  <div
                    className={cn("size-9 rounded-xl", skeletonBg)}
                    aria-hidden
                    data-testid="shell-header-brand-skeleton"
                  />
                ) : (
                  brandMark
                )}
              </div>
            ) : null}
            <div className="min-w-0">
              {label ? <p className={cn("text-sm font-medium", subTitleText)}>{label}</p> : null}
              <h1 className="truncate text-lg font-semibold tracking-tight">{title}</h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {headerActions}
            {userCard ? <div className="hidden items-center gap-2 md:flex">{userCard}</div> : null}
            {isLoading ? (
              <div
                className={cn("size-9 rounded-md md:hidden", skeletonBg)}
                aria-hidden
                data-testid="shell-header-menu-skeleton"
              />
            ) : (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn("md:hidden", buttonClass)}
                aria-label={openMenuLabel}
                aria-expanded={menuOpen}
                aria-controls={menuSheetId}
                onClick={() => onMenuOpenChange?.(true)}
              >
                <Bars3Icon {...iconProps({ size: "md" })} />
              </Button>
            )}
          </div>
        </div>
      </header>
      {menuSheet}
    </>
  );
}

export function useShellMenuState(initialState = false) {
  return useState(initialState);
}
