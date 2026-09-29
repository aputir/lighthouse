import { Badge, cn } from "@manovaspace/ui";
import type { ComponentProps } from "react";

const stageStyles: Record<string, string> = {
  dormant: "bg-muted text-muted-foreground",
  under_restoration: "bg-status-warning text-status-warning-foreground",
  operational: "bg-primary text-primary-foreground",
  flourishing: "bg-status-success text-status-success-foreground",
};

export function LandmarkStageBadge({
  stage,
  children,
  className,
  ...props
}: { stage: string } & Omit<ComponentProps<typeof Badge>, "variant">) {
  return (
    <Badge
      variant="outline"
      className={cn("border-transparent", stageStyles[stage] ?? stageStyles.dormant, className)}
      {...props}
    >
      {children}
    </Badge>
  );
}
