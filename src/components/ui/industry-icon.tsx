import {
  Briefcase,
  Building2,
  Factory,
  GraduationCap,
  Rocket,
  ShoppingBag,
  Stethoscope,
  Truck,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import type { IndustryIconName } from "@/lib/industries";
import { cn } from "@/lib/utils";

/** Named lookup, so only these glyphs end up in the bundle. */
export const INDUSTRY_ICONS: Record<IndustryIconName, LucideIcon> = {
  store: ShoppingBag,
  stethoscope: Stethoscope,
  graduation: GraduationCap,
  building: Building2,
  factory: Factory,
  truck: Truck,
  utensils: UtensilsCrossed,
  briefcase: Briefcase,
  rocket: Rocket,
};

export interface IndustryIconProps {
  name: IndustryIconName;
  className?: string;
  size?: number;
}

/** Brand-tinted tile, the neutral sibling of the gradient `ServiceIcon`. */
export function IndustryIcon({ name, className, size = 22 }: IndustryIconProps) {
  const Icon = INDUSTRY_ICONS[name] ?? Briefcase;
  return (
    <span
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-setu/10 text-setu ring-1 ring-inset ring-setu/15",
        className,
      )}
    >
      <Icon size={size} strokeWidth={1.9} aria-hidden />
    </span>
  );
}
