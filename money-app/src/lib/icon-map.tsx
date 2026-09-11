import type { CSSProperties } from "react";
import {
  ShoppingCart,
  Utensils,
  Car,
  ShoppingBag,
  Shirt,
  Home,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  Plane,
  Repeat,
  MoreHorizontal,
  Wallet,
  Briefcase,
  Gift,
  TrendingUp,
  Coffee,
  Gamepad2,
  Dumbbell,
  PawPrint,
  Fuel,
  Music,
  BookOpen,
  Baby,
  Wrench,
  Smartphone,
  Landmark,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  ShoppingCart,
  Utensils,
  Car,
  ShoppingBag,
  Shirt,
  Home,
  Zap,
  Film,
  HeartPulse,
  GraduationCap,
  Plane,
  Repeat,
  MoreHorizontal,
  Wallet,
  Briefcase,
  Gift,
  TrendingUp,
  Coffee,
  Gamepad2,
  Dumbbell,
  PawPrint,
  Fuel,
  Music,
  BookOpen,
  Baby,
  Wrench,
  Smartphone,
  Landmark,
};

export const SELECTABLE_ICON_NAMES = Object.keys(ICON_MAP);

export function getIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? MoreHorizontal;
}

/**
 * Resolves an icon by name and renders it. Prefer this over
 * `const Icon = getIcon(name)` followed by `<Icon />` at a JSX call site —
 * doing the lookup inline in a shared component (rather than assigning a
 * capitalized variable during another component's render) keeps identity
 * stable across renders.
 */
export function CategoryIcon({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  const Icon = ICON_MAP[name] ?? MoreHorizontal;
  return <Icon className={className} style={style} />;
}
