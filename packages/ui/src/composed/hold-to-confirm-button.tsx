"use client";

import { cn } from "@manovaspace/ui";
import { type JSX, useCallback, useEffect, useId, useRef, useState } from "react";
import { flushSync } from "react-dom";

const DEFAULT_HOLD_MS = 1000;
const DEFAULT_TAP_HINT_THRESHOLD_MS = 400;

export type HoldToConfirmButtonProps = {
  onConfirm: () => void;
  onShortTapHint?: () => void;
  holdDurationMs?: number;
  tapHintThresholdMs?: number;
  labelIdle: string;
  ariaDescription: string;
  variant?: "destructive" | "caution" | "default";
  size?: "default" | "lg";
  disabled?: boolean;
  className?: string;
};

const VARIANT_CLASSES = {
  destructive: {
    button:
      "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
    fill: "bg-black/25 dark:bg-white/20",
  },
  caution: {
    button:
      "bg-status-warning text-status-warning-foreground shadow-xs hover:bg-status-warning/90 focus-visible:ring-status-warning/30",
    fill: "bg-black/25 dark:bg-white/20",
  },
  default: {
    button:
      "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 focus-visible:ring-ring/50",
    fill: "bg-black/20 dark:bg-white/20",
  },
} as const;

const SIZE_CLASSES = {
  default: "min-h-10 px-4 py-2 text-sm",
  lg: "min-h-11 px-6 py-2.5 text-sm",
} as const;

/**
 * Reusable press-and-hold button for destructive or cautionary confirmations.
 * Progress fill advances linearly with elapsed time (0 -> holdDurationMs).
 * Quick taps below tapHintThresholdMs trigger onShortTapHint.
 * Supports RTL, pointer capture, keyboard Space holding, and screen readers.
 */
export function HoldToConfirmButton({
  onConfirm,
  onShortTapHint,
  holdDurationMs = DEFAULT_HOLD_MS,
  tapHintThresholdMs = DEFAULT_TAP_HINT_THRESHOLD_MS,
  labelIdle,
  ariaDescription,
  variant = "destructive",
  size = "default",
  disabled = false,
  className,
}: HoldToConfirmButtonProps): JSX.Element {
  const descId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [progress, setProgress] = useState(0);
  const holdingRef = useRef(false);
  const completedRef = useRef(false);
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);

  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;
  const onShortTapHintRef = useRef(onShortTapHint);
  onShortTapHintRef.current = onShortTapHint;

  const clearRaf = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const reset = useCallback(() => {
    if (completedRef.current) return;
    holdingRef.current = false;
    clearRaf();
    setProgress(0);
  }, [clearRaf]);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    holdingRef.current = false;
    clearRaf();
    flushSync(() => {
      setProgress(1);
    });
    onConfirmRef.current();
  }, [clearRaf]);

  const startHold = useCallback(() => {
    if (completedRef.current || disabled) return;
    holdingRef.current = true;
    startTimeRef.current = performance.now();
    clearRaf();

    const loop = (now: number) => {
      if (!holdingRef.current || completedRef.current) return;
      const currentTime = typeof now === "number" && now > 0 ? now : performance.now();
      const elapsed = currentTime - startTimeRef.current;
      const t = Math.min(1, elapsed / holdDurationMs);
      setProgress(t);
      if (t >= 1) {
        finish();
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [clearRaf, disabled, finish, holdDurationMs]);

  const endHold = useCallback(() => {
    if (completedRef.current) return;
    const wasHolding = holdingRef.current;
    const elapsed = wasHolding ? performance.now() - startTimeRef.current : 0;
    reset();
    if (wasHolding && elapsed < tapHintThresholdMs) {
      onShortTapHintRef.current?.();
    }
  }, [reset, tapHintThresholdMs]);

  useEffect(() => {
    if (!disabled && completedRef.current && progress === 0) {
      completedRef.current = false;
    }
  }, [disabled, progress]);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const handleLeave = () => reset();
    el.addEventListener("mouseleave", handleLeave);
    el.addEventListener("pointerleave", handleLeave);
    return () => {
      el.removeEventListener("mouseleave", handleLeave);
      el.removeEventListener("pointerleave", handleLeave);
    };
  }, [reset]);

  useEffect(() => {
    return () => clearRaf();
  }, [clearRaf]);

  const fillWidthPct = Math.min(100, Math.max(0, progress * 100));
  const variantConfig = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.destructive;
  const sizeConfig = SIZE_CLASSES[size] ?? SIZE_CLASSES.default;

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      aria-label={labelIdle}
      aria-describedby={descId}
      aria-busy={progress >= 1}
      aria-disabled={disabled}
      className={cn(
        "relative inline-flex items-center justify-center font-medium rounded-[var(--radius-lg)] overflow-hidden select-none touch-none transition-colors outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        variantConfig.button,
        sizeConfig,
        className,
      )}
      onPointerDown={(e) => {
        if (disabled || e.button !== 0) return;
        e.preventDefault();
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        startHold();
      }}
      onPointerUp={endHold}
      onPointerCancel={reset}
      onLostPointerCapture={reset}
      onMouseLeave={reset}
      onKeyDown={(e) => {
        if (disabled || e.key !== " " || e.repeat) return;
        e.preventDefault();
        startHold();
      }}
      onKeyUp={(e) => {
        if (e.key !== " ") return;
        endHold();
      }}
      onBlur={reset}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span id={descId} className="sr-only">
        {ariaDescription}
      </span>

      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 start-0 z-0 transition-none",
          variantConfig.fill,
          progress >= 1 ? "rounded-[var(--radius-lg)]" : "rounded-s-[var(--radius-lg)]",
        )}
        style={{ width: `${fillWidthPct}%`, insetInlineStart: 0 }}
        aria-hidden="true"
      />

      <span className="relative z-[1] flex w-full items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap">
        <span className="tabular-nums">{labelIdle}</span>
      </span>
    </button>
  );
}
