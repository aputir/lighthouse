"use client";

import {
  Avatar,
  AvatarFallback,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lighthouse/ui";
import { signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function UserMenu({ userName }: { userName: string }) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const otherLocale = locale === "fa" ? "en" : "fa";
  const switchedPath = pathname
    ? pathname.replace(`/${locale}`, `/${otherLocale}`)
    : `/${otherLocale}`;
  const initials = (userName || "?").slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="size-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={switchedPath}>
            {t("common.language")}: {otherLocale === "fa" ? "فارسی" : "English"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: `/${locale}/login` })}>
          {t("common.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
