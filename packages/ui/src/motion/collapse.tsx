"use client";

import { cn } from "@manovaspace/ui";
import {
  type HTMLAttributes,
  type ReactNode,
  type TransitionEvent,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export const COLLAPSE_OPEN_DURATION_S = 0.32;
export const COLLAPSE_CLOSE_DURATION_S = 0.24;

export type CollapseProps = HTMLAttributes<HTMLDivElement> & {
  open: boolean;
  contentKey?: string;
  children?: ReactNode;
};

/** CSS grid height + opacity reveal — respects `prefers-reduced-motion`. */
export function Collapse({
  open,
  contentKey,
  className,
  children,
  onTransitionEnd,
  style,
  ...props
}: CollapseProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const previousContentHeightRef = useRef<number | undefined>(undefined);
  const [morphHeight, setMorphHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (contentKey === undefined || !inner || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      const nextHeight = entry?.contentRect.height;
      if (nextHeight === undefined) {
        return;
      }

      const previousHeight = previousContentHeightRef.current;
      previousContentHeightRef.current = nextHeight;
      if (!open || previousHeight === undefined || previousHeight === nextHeight) {
        return;
      }

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      setMorphHeight(previousHeight);
      frameRef.current = requestAnimationFrame(() => {
        setMorphHeight(nextHeight);
        frameRef.current = null;
      });
    });

    observer.observe(inner);
    return () => {
      observer.disconnect();
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [contentKey, open]);

  useLayoutEffect(() => {
    if (!open) {
      setMorphHeight(null);
    }
  }, [open]);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    onTransitionEnd?.(event);
    if (event.propertyName === "height" && open) {
      setMorphHeight(null);
    }
  };

  return (
    <div
      className={cn(
        "grid overflow-hidden transition-[grid-template-rows,height,opacity] ease-[cubic-bezier(0.215,0.61,0.355,1)] motion-reduce:transition-none",
        open
          ? "grid-rows-[1fr] opacity-100 duration-[320ms]"
          : "grid-rows-[0fr] opacity-0 duration-[240ms]",
        className,
      )}
      style={{
        ...style,
        ...(open && morphHeight !== null ? { height: `${morphHeight}px` } : {}),
      }}
      onTransitionEnd={handleTransitionEnd}
      {...props}
    >
      <div ref={innerRef} key={contentKey} className="min-h-0">
        {children}
      </div>
    </div>
  );
}

/** Chevron rotation paired with `Collapse` — pass current open state for matched duration. */
export function collapseChevronClassName(open: boolean): string {
  return cn(
    "transition-transform ease-[cubic-bezier(0.215,0.61,0.355,1)] motion-reduce:transition-none",
    open ? "duration-[320ms]" : "duration-[240ms]",
  );
}
