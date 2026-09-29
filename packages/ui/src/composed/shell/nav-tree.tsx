"use client";

import { Badge, type IconProps, cn, iconProps } from "@manovaspace/ui";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";
import { ChevronDownIcon } from "../../icons";
import { Collapse, collapseChevronClassName } from "../../motion/collapse";

export type NavSubsection = {
  href: string;
  label: ReactNode;
  key?: string | undefined;
  badge?: ReactNode;
  exact?: boolean | undefined;
};

export type NavItemConfig = {
  href: string;
  label: ReactNode;
  icon?: ComponentType<IconProps> | undefined;
  key?: string | undefined;
  badge?: ReactNode;
  subsections?: readonly NavSubsection[] | undefined;
  isAction?: boolean | undefined;
  onClick?: (() => void) | undefined;
  exact?: boolean | undefined;
};

export type NavTreeLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  "aria-current"?: "page";
};

export interface NavTreeProps {
  items: readonly NavItemConfig[];
  currentPath?: string | undefined;
  onNavigate?: (() => void) | undefined;
  asLink?: ComponentType<NavTreeLinkProps> | undefined;
  className?: string | undefined;
}

function isRouteActive(currentPath: string | undefined, href: string, exact?: boolean): boolean {
  if (!currentPath) {
    return false;
  }
  if (currentPath === href) {
    return true;
  }
  if (exact) {
    return false;
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
  if (isRouteActive(currentPath, item.href, item.exact)) {
    return true;
  }
  return Boolean(item.subsections?.some((sub) => isRouteActive(currentPath, sub.href, sub.exact)));
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
}: NavTreeLinkProps) {
  return (
    <a
      href={href}
      className={className}
      {...(onClick ? { onClick } : {})}
      {...(ariaCurrent ? { "aria-current": ariaCurrent } : {})}
    >
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
  currentPath?: string | undefined;
  onNavigate?: (() => void) | undefined;
  Link: ComponentType<NavTreeLinkProps>;
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
            const isSubActive = isRouteActive(currentPath, subsection.href, subsection.exact);
            const subKey = subsection.key ?? subsection.href ?? String(index);

            return (
              <li key={subKey}>
                <Link
                  href={subsection.href}
                  className={navSubsectionClass(isSubActive)}
                  {...(onNavigate ? { onClick: onNavigate } : {})}
                  {...(isSubActive ? { "aria-current": "page" as const } : {})}
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
  currentPath?: string | undefined;
  onNavigate?: (() => void) | undefined;
  Link: ComponentType<NavTreeLinkProps>;
}) {
  const isActive = isRouteActive(currentPath, item.href, item.exact);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={navItemClass(isActive)}
      {...(onNavigate ? { onClick: onNavigate } : {})}
      {...(isActive ? { "aria-current": "page" as const } : {})}
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
  onNavigate?: (() => void) | undefined;
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
