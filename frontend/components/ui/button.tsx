import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Standard shadcn button roles. Old CMS values are compatibility aliases only.
// The site's four editor-chosen button colours map onto `primary`,
// `secondary`, `primary-inverted` and `secondary-inverted` in
// lib/button-colour.ts, drawn at the `cta` size of the old site's buttons.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
        primary:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-hover",
        "primary-inverted":
          "bg-primary-foreground text-primary shadow-sm hover:bg-primary-hover hover:text-primary-foreground",
        "secondary-inverted":
          "bg-secondary-foreground text-secondary shadow-sm hover:bg-secondary-hover hover:text-secondary-foreground",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-link underline-offset-4 hover:text-link-hover hover:underline",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        copper:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
        compact: "h-8 rounded-md px-3 text-xs",
        hero: "h-10 rounded-md px-8",
        cta: "h-auto gap-3 rounded-[var(--radius-button)] px-4 pt-4 pb-3 text-lg leading-tight font-bold shadow-lg sm:px-6 sm:pt-5 sm:pb-[1.0625rem] md:rounded-[var(--radius-button-md)] [&_svg]:h-[1em] [&_svg]:w-auto [&_svg]:text-[1.5em]",
      },
      onDark: { true: "", false: "" },
      emphasis: { true: "", false: "" },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      onDark: false,
      emphasis: false,
    },
  },
);
function Button({
  className,
  variant,
  size,
  onDark,
  emphasis,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, onDark, emphasis, className }),
      )}
      {...props}
    />
  );
}
export { Button, buttonVariants };
