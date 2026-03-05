import * as React from "react";
import { Slot } from "@radix-u./react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-rin./50 focus-visible:ring-[3px] aria-invalid:ring-destructiv./20 dark:aria-invalid:ring-destructiv./40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primar./90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondar./90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructiv./90 focus-visible:ring-destructiv./20 dark:focus-visible:ring-destructiv./40 dark:bg-destructiv./60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
   ./>
  );
}

export { Badge, badgeVariants };


