"use client";

import {
  ConfirmDialog as BaseConfirmDialog,
  type ConfirmDialogProps as BaseConfirmDialogProps,
} from "@manovaspace/ui";
import type * as React from "react";

export type ConfirmDialogProps = Omit<BaseConfirmDialogProps, "trigger"> & {
  trigger?: React.ReactElement;
  children?: React.ReactElement;
};

export function ConfirmDialog({ trigger, children, ...props }: ConfirmDialogProps) {
  const resolvedTrigger = trigger ?? children;
  if (resolvedTrigger) {
    return <BaseConfirmDialog trigger={resolvedTrigger} {...props} />;
  }
  return <BaseConfirmDialog {...props} />;
}
