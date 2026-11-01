import {
  Boxes,
  Code2,
  Globe,
  Megaphone,
  Palette,
  Server,
  Shield,
  ShoppingCart,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import type { IconName } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Named icon lookup. Importing the specific icons keeps the rest of the
 * `lucide-react` set out of the bundle.
 */
const ICONS: Record<IconName, LucideIcon> = {
  globe: Globe,
  cart: ShoppingCart,
  megaphone: Megaphone,
  boxes: Boxes,
  code: Code2,
  smartphone: Smartphone,
  server: Server,
  sparkles: Sparkles,
  palette: Palette,
  shield: Shield,
};

export interface ServiceIconProps {
  name: IconName;
  accent: readonly [string, string];
  className?: string;
  size?: number;
}

export function ServiceIcon({
  name,
  accent,
  className,
  size = 22,
}: ServiceIconProps) {
  const Icon = ICONS[name] ?? Code2;
  return (
    <span
      className={cn(
        "inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-white",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(135deg, ${accent[0]}, ${accent[1]})`,
      }}
    >
      <Icon size={size} strokeWidth={2} aria-hidden />
    </span>
  );
}
