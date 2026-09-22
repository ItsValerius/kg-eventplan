import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-md text-[13px] leading-[1.2] font-semibold transition-colors duration-180 disabled:opacity-55 aria-invalid:border-destructive [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-0 bg-primary text-primary-foreground hover:bg-primary-dark",
        outline:
          "border border-border bg-background hover:border-[#99ae94] hover:bg-muted",
        ghost: "border-0 bg-transparent hover:bg-muted",
        destructive: "border-0 bg-[#a33928] text-white hover:bg-destructive",
        link: "border-0 bg-transparent text-primary underline-offset-4 hover:underline print:hidden",
      },
      size: {
        default: "min-h-[45px] gap-3 px-[19px] py-3",
        icon: "size-10 gap-0 rounded-[5px] p-0 text-primary max-md:size-9",
        link: "min-h-[35px] gap-2.5 rounded-none p-0 text-xs",
        month: "h-auto min-h-0 gap-3",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
export { Button, buttonVariants };
