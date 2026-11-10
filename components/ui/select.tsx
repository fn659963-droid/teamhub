"use client";
import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = RadixSelect.Root;
export const SelectValue = RadixSelect.Value;

export function SelectTrigger({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof RadixSelect.Trigger>) {
  return (
    <RadixSelect.Trigger
      className={cn(
        "flex h-11 w-full items-center justify-between rounded-lg border border-neutral-300 bg-white px-4 py-2 text-base text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 focus:border-black disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <RadixSelect.Icon asChild>
        <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  );
}

export function SelectContent({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof RadixSelect.Content>) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        className={cn(
          "relative z-50 min-w-[8rem] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg",
          className
        )}
        {...props}
      >
        <RadixSelect.Viewport className="p-1.5">{children}</RadixSelect.Viewport>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
}

export function SelectItem({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof RadixSelect.Item>) {
  return (
    <RadixSelect.Item
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-lg px-2 py-2 text-base text-black outline-none focus:bg-neutral-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <RadixSelect.ItemIndicator>
          <Check className="h-4 w-4 text-black" />
        </RadixSelect.ItemIndicator>
      </span>
      <RadixSelect.ItemText className="pl-6">{children}</RadixSelect.ItemText>
    </RadixSelect.Item>
  );
}
