import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-[46px] w-full min-w-0 rounded-[5px] border border-input bg-background p-3 text-[15px] transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:border-destructive max-md:text-base",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
