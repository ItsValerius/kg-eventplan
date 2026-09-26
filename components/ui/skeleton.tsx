import { cn } from "cn";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "animate-shimmer rounded-sm bg-[linear-gradient(90deg,var(--shimmer-base)_30%,var(--shimmer-highlight)_50%,var(--shimmer-base)_70%)] bg-size-[200%_100%]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
