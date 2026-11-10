import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        default:     "bg-black text-white hover:bg-neutral-800",
        destructive: "bg-black text-white hover:bg-neutral-800 border border-black",
        outline:     "border border-neutral-300 bg-white hover:bg-neutral-100 text-black",
        ghost:       "hover:bg-neutral-100 text-black",
        link:        "text-black underline-offset-4 hover:underline",
        secondary:   "bg-neutral-100 text-black hover:bg-neutral-200",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm:      "h-9 px-4 text-sm",
        lg:      "h-12 px-7 text-lg",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
