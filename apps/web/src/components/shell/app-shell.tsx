"use client";

import {
  type NavItemConfig,
  NavMobileSheet,
  NavRail,
  NavTree,
  ShellHeader,
  useShellMenuState,
} from "@lighthouse/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function AppShell({
  title,
  label,
  navItems,
  openMenuLabel,
  navigationLabel,
  userMenu,
  children,
}: {
  title: string;
  label?: string;
  navItems: NavItemConfig[];
  openMenuLabel: string;
  navigationLabel: string;
  userMenu: ReactNode;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useShellMenuState();
  const pathname = usePathname();
  const menuSheetId = "mobile-nav-sheet";

  return (
    <div className="flex min-h-screen flex-col">
      <ShellHeader
        title={title}
        label={label}
        openMenuLabel={openMenuLabel}
        menuOpen={menuOpen}
        onMenuOpenChange={setMenuOpen}
        menuSheetId={menuSheetId}
        headerActions={userMenu}
        menuSheet={
          <NavMobileSheet
            id={menuSheetId}
            open={menuOpen}
            onOpenChange={setMenuOpen}
            title={navigationLabel}
          >
            <NavTree
              items={navItems}
              currentPath={pathname ?? undefined}
              onNavigate={() => setMenuOpen(false)}
              asLink={Link}
            />
          </NavMobileSheet>
        }
      />
      <div className="flex min-h-0 flex-1">
        <NavRail>
          <NavTree items={navItems} currentPath={pathname ?? undefined} asLink={Link} />
        </NavRail>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
