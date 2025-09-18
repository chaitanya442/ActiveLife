
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardList,
  TrendingUp,
  User,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Plan", href: "/plan", icon: ClipboardList },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Profile", href: "/profile", icon: User },
];

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
  onLinkClick?: () => void;
}


export function MainNav({ className, onLinkClick, ...props }: MainNavProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    return pathname === href;
  }

  return (
    <nav
      className={cn("flex flex-col items-start gap-2", className)}
      {...props}
    >
      {navigation.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          onClick={onLinkClick}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary w-full",
            isLinkActive(item.href) && "bg-secondary text-primary font-semibold"
          )}
        >
          <item.icon className="h-4 w-4" />
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
