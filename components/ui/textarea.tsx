import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "block min-h-[100px] w-full resize-y rounded-[5px] border border-input bg-background p-3 text-[15px] transition-colors disabled:cursor-not-allowed disabled:opacity-55 aria-invalid:border-destructive max-md:text-base",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
