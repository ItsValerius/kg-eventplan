"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    // The hidden label names the theme a click switches to; CSS picks it, like the icons,
    // so server and client markup match. The tight focus ring clears the footer rule.
    <Button
      variant="ghost"
      size="icon"
      className={cn("text-foreground focus-visible:outline-offset-0", className)}
      title="Design wechseln"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Moon className="size-4.5 dark:hidden" />
      <Sun className="hidden size-4.5 dark:block" />
      <span className="sr-only dark:hidden">Dunkles Design</span>
      <span className="sr-only hidden dark:inline">Helles Design</span>
    </Button>
  );
}
