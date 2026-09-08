import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* Overrides shadcn's default button.tsx.
   The one rule that does NOT map from shadcn's defaults: in this system the
   primary action is an ACCENT OUTLINE on transparent, never a solid fill.
   Large accent fills are off the page by design. */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-body text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        // primary: accent outline, tinted on hover, deeper on press
        default:
          "border border-accent-500 bg-transparent text-accent-800 hover:bg-accent-100 active:bg-accent-200 active:border-accent-600",
        // secondary: ink hairline
        secondary:
          "border border-border bg-transparent text-foreground hover:bg-accent-100/60 active:bg-accent-200/70",
        ghost:
          "bg-transparent text-accent-800 hover:bg-accent-100 active:bg-accent-200",
        link: "text-accent-700 underline-offset-4 hover:underline hover:text-accent-800",
        destructive:
          "border border-destructive bg-transparent text-destructive hover:bg-destructive/10",
        // escape hatch — use sparingly, against the system's grain
        solid: "bg-accent-700 text-primary-foreground hover:bg-accent-800",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
