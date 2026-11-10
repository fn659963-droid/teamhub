import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

const variantClasses: Record<BadgeVariant, string> = {
  default:     "bg-black text-white",
  secondary:   "bg-neutral-100 text-neutral-600",
  destructive: "bg-black text-white",
  outline:     "border border-neutral-300 text-neutral-600 bg-white",
  success:     "bg-neutral-200 text-black",
  warning:     "bg-neutral-200 text-black",
};

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-semibold tracking-wide",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
