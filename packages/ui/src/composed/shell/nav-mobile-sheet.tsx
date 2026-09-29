"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  cn,
} from "@manovaspace/ui";
import type { ReactNode } from "react";

export interface NavMobileSheetProps {
  id?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  userCard?: ReactNode;
  className?: string;
}

export function NavMobileSheet({
  id,
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  userCard,
  className,
}: NavMobileSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id={id}
        side="right"
        className={cn("flex w-full flex-col gap-0 p-0 sm:max-w-xs", className)}
      >
        <SheetHeader
          className={cn("border-b border-border px-4 py-4", !title && !description && "sr-only")}
        >
          <SheetTitle>{title ?? "Navigation"}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        {userCard ? <div className="mx-4 mt-3 shrink-0">{userCard}</div> : null}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          {children}
        </div>
        {footer ? (
          <SheetFooter className="gap-2 border-t border-border p-4">{footer}</SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
