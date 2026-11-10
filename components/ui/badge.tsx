import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default:     "bg-indigo-600 text-white",
  secondary:   "bg-slate-100 text-slate-700",
  destructive: "bg-red-100 text-red-700",
  outline:     "border border-slate-300 text-slate-600 bg-white",
  success:     "bg-emerald-100 text-emerald-700",
  warning:     "bg-amber-100 text-amber-700",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
