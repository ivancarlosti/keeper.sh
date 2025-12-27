"use client";

import type { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Puzzle,
  CreditCard,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { tv } from "tailwind-variants";

const sidebarLink = tv({
  base: "flex items-center text-sm gap-1 py-1 px-1.5 pr-8 rounded-sm tracking-tight",
  variants: {
    active: {
      true: "bg-surface-muted text-foreground",
      false: "text-foreground-secondary hover:text-foreground hover:bg-surface-subtle",
    },
  },
  defaultVariants: {
    active: false,
  },
});

interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
  commercialOnly?: boolean;
}

function isCommercialMode(): boolean {
  return process.env.NEXT_PUBLIC_COMMERCIAL_MODE === "true";
}

function getVisibleSidebarItems(): SidebarItem[] {
  const allItems: SidebarItem[] = [
    { href: "/dashboard", label: "Agenda", icon: CalendarDays },
    { href: "/dashboard/integrations", label: "Integrations", icon: Puzzle },
    { href: "/dashboard/billing", label: "Billing", icon: CreditCard, commercialOnly: true },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  if (isCommercialMode()) {
    return allItems;
  }

  return allItems.filter((item) => !item.commercialOnly);
}

export const DashboardSidebar: FC = () => {
  const pathname = usePathname();
  const visibleItems = getVisibleSidebarItems();

  return (
    <nav className="flex flex-col gap-0.5 shrink-0 sticky top-2 self-start">
      {visibleItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={sidebarLink({ active: pathname === item.href })}
        >
          <item.icon size={15} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
};
