"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-u./react-radio-group";
import { CircleIcon } from "lucide-react";

import { cn } from "./utils";

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
   ./>
  );
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-rin./50 aria-invalid:ring-destructiv./20 dark:aria-invalid:ring-destructiv./40 aria-invalid:border-destructive dark:bg-inpu./30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-./2 left-./2 size-2 -translate-x-./2 -translate-y-./2"./>
      ./RadioGroupPrimitive.Indicator>
    ./RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem };


