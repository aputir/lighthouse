"use client";

import { Badge, type IconProps, cn, iconProps } from "@manovaspace/ui";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";
import { ChevronDownIcon } from "../../icons.js";
import { Collapse, collapseChevronClassName } from "../../motion/collapse.js";

export type NavSubsection = {
  href: string;
  label: ReactNode;
  key?: string;
  badge?: ReactNode;
};

export type NavItemConfig = {
  href: string;
  label: ReactNode;
  icon?: ComponentType<IconProps>;
  key?: string;
  badge?: ReactNode;
  subsections?: readonly NavSubsection[];
  isAction?: boolean;
  onClick?: () => void;
};

export interface NavTreeProps {
  items: readonly NavItemConfig[];
  currentPath?: string;
  onNavigate?: () => void;
  asLink?: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
    onClick?: () => void;
    "aria-current"?: "page" | undefined;
  }>;
  className?: string;
}

function isRouteActive(currentPath: string | undefined, href: string): boolean {
  if (!currentPath) {
    return false;
  }
  if (currentPath === href) {
    return true;
  }
  if (href === "" || href === "/") {
    return false;
  }
  const prefix = href.endsWith("/") ? href : `${href}/`;
  return (
    currentPath.startsWith(prefix) ||
    currentPath.startsWith(`${href}?`) ||
    currentPath.startsWith(`${href}#`)
  );
}

function isSectionActive(item: NavItemConfig, currentPath?: string): boolean {
  if (!currentPath) {
    return false;
  }
  if (isRouteActive(currentPath, item.href)) {
    return true;
  }
  return Boolean(item.subsections?.some((sub) => isRouteActive(currentPath, sub.href)));
}

function renderBadge(badge: ReactNode) {
  if (badge === null || badge === undefined || badge === false) {
    return null;
  }
  if (typeof badge === "string" || typeof badge === "number") {
    return (
      <Badge
        variant="secondary"
        className="min-w-5 justify-center px-1.5 py-0 text-[10px] tabular-nums"
      >
        {badge}
      </Badge>
    );
  }
  return badge;
}

function DefaultLink({
  href,
  className,
  children,
  onClick,
  "aria-current": ariaCurrent,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  "aria-current"?: "page" | undefined;
}) {
  return (
    <a href={href} className={className} onClick={onClick} aria-current={ariaCurrent}>
      {children}
    </a>
  );
}

const navItemClass = (active: boolean) =>
  cn(
    "flex w-full items-center gap-2.5 rounded-e-md border-s-4 border-transparent px-3 py-2 text-start text-sm font-medium transition-colors cursor-pointer",
    active
      ? "border-primary bg-primary/15 text-foreground"
      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
  );

const navSubsectionClass = (active: boolean) =>
  cn(
    "block cursor-pointer rounded-e-md border-s-4 border-transparent py-2 pe-3 ps-9 text-sm transition-colors",
    active
      ? "border-primary bg-primary/15 font-medium text-foreground"
      : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
  );

function NavSectionItem({
  item,
  currentPath,
  onNavigate,
  Link,
}: {
  item: NavItemConfig;
  currentPath?: string;
  onNavigate?: () => void;
  Link: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
    onClick?: () => void;
    "aria-current"?: "page" | undefined;
  }>;
}) {
  const sectionActive = isSectionActive(item, currentPath);
  const [isOpen, setIsOpen] = useState(sectionActive);

  useEffect(() => {
    if (sectionActive) {
      setIsOpen(true);
    }
  }, [sectionActive]);

  const Icon = item.icon;

  return (
    <div className="space-y-0.5">
      <button
        type="button"
        className={navItemClass(sectionActive)}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2.5">
          {Icon ? (
            <Icon
              {...iconProps({
                size: "sm",
                className: sectionActive ? "text-primary" : undefined,
              })}
            />
          ) : null}
          <span className="truncate">{item.label}</span>
        </span>
        {item.badge ? (
          <span className="flex shrink-0 items-center gap-1">{renderBadge(item.badge)}</span>
        ) : null}
        <ChevronDownIcon
          className={cn(
            collapseChevronClassName(isOpen),
            "size-4 shrink-0 text-muted-foreground",
            isOpen ? "rotate-180" : "rotate-0",
          )}
          aria-hidden
        />
      </button>

      <Collapse open={isOpen}>
        <ul className="space-y-0.5 pb-1">
          {item.subsections?.map((subsection, index) => {
            const isSubActive = isRouteActive(currentPath, subsection.href);
            const subKey = subsection.key ?? subsection.href ?? String(index);

            return (
              <li key={subKey}>
                <Link
                  href={subsection.href}
                  onClick={onNavigate}
                  className={navSubsectionClass(isSubActive)}
                  aria-current={isSubActive ? "page" : undefined}
                >
                  <span className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate">{subsection.label}</span>
                    {subsection.badge ? (
                      <span className="ms-auto flex shrink-0 items-center gap-1">
                        {renderBadge(subsection.badge)}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Collapse>
    </div>
  );
}

function NavLinkItem({
  item,
  currentPath,
  onNavigate,
  Link,
}: {
  item: NavItemConfig;
  currentPath?: string;
  onNavigate?: () => void;
  Link: ComponentType<{
    href: string;
    className?: string;
    children: ReactNode;
    onClick?: () => void;
    "aria-current"?: "page" | undefined;
  }>;
}) {
  const isActive = isRouteActive(currentPath, item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={navItemClass(isActive)}
      aria-current={isActive ? "page" : undefined}
    >
      {Icon ? (
        <Icon
          {...iconProps({
            size: "sm",
            className: isActive ? "text-primary" : undefined,
          })}
        />
      ) : null}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span className="ms-auto flex shrink-0 items-center gap-1">{renderBadge(item.badge)}</span>
      ) : null}
    </Link>
  );
}

function NavActionItem({
  item,
  onNavigate,
}: {
  item: NavItemConfig;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={() => {
        item.onClick?.();
        onNavigate?.();
      }}
      className={navItemClass(false)}
    >
      {Icon ? (
        <Icon
          {...iconProps({
            size: "sm",
          })}
        />
      ) : null}
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span className="ms-auto flex shrink-0 items-center gap-1">{renderBadge(item.badge)}</span>
      ) : null}
    </button>
  );
}

export function NavTree({ items, currentPath, onNavigate, asLink, className }: NavTreeProps) {
  const Link = asLink ?? DefaultLink;

  return (
    <nav className={cn("space-y-1", className)}>
      {items.map((item, index) => {
        const itemKey = item.key ?? item.href ?? String(index);

        if (item.isAction) {
          return <NavActionItem key={itemKey} item={item} onNavigate={onNavigate} />;
        }

        if (item.subsections && item.subsections.length > 0) {
          return (
            <NavSectionItem
              key={itemKey}
              item={item}
              currentPath={currentPath}
              onNavigate={onNavigate}
              Link={Link}
            />
          );
        }

        return (
          <NavLinkItem
            key={itemKey}
            item={item}
            currentPath={currentPath}
            onNavigate={onNavigate}
            Link={Link}
          />
        );
      })}
    </nav>
  );
}
