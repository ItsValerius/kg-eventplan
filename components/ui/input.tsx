import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "cn";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11.5 w-full min-w-0 rounded-md border border-input bg-background p-3 text-[15px] transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:border-destructive max-md:text-base",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
