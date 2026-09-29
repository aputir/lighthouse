"use client";

import { cn, useDirection } from "@manovaspace/ui";
import type { ComponentProps } from "react";

/** Vertical stack for a label, control, hints, and validation messages. */
export function FieldGroup({ className, ...props }: ComponentProps<"div">) {
  const direction = useDirection();

  return (
    <div
      data-slot="field-group"
      dir={direction}
      className={cn("grid gap-2 text-start", className)}
      {...props}
    />
  );
}

/** Secondary guidance shown below a control (always visible when set). */
export function FieldDescription({ className, ...props }: ComponentProps<"p">) {
  const direction = useDirection();

  return (
    <p
      data-slot="field-description"
      dir={direction}
      className={cn("text-sm text-muted-foreground text-start", className)}
      {...props}
    />
  );
}
