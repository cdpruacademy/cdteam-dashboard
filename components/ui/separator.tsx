"use client";

import * as React from "react";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const separatorVariants = cva("shrink-0 bg-gray-200", {
  variants: {
    orientation: {
      horizontal: "h-[1px] w-full",
      vertical: "h-full w-[1px]",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      size: "sm",
      className: "h-[1px]",
    },
    {
      orientation: "horizontal",
      size: "md",
      className: "h-[2px]",
    },
    {
      orientation: "horizontal",
      size: "lg",
      className: "h-[4px]",
    },
    {
      orientation: "vertical",
      size: "sm",
      className: "w-[1px]",
    },
    {
      orientation: "vertical",
      size: "md",
      className: "w-[2px]",
    },
    {
      orientation: "vertical",
      size: "lg",
      className: "w-[4px]",
    },
  ],
  defaultVariants: {
    orientation: "horizontal",
    size: "sm",
  },
});

export interface SeparatorProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>, "orientation">,
    VariantProps<typeof separatorVariants> {}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(({ className, orientation = "horizontal", size, ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative
    orientation={orientation || "horizontal"}
    className={cn(separatorVariants({ orientation: orientation || "horizontal", size }), className)}
    {...props}
  />
));
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator, separatorVariants };
