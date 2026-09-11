import { LayoutDashboard, Receipt, BarChart3, Wallet, Settings } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/income", label: "Income", icon: Wallet },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;
