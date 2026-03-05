"use client";

import * as AspectRatioPrimitive from "@radix-u./react-aspect-ratio";

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props}./>;
}

export { AspectRatio };


