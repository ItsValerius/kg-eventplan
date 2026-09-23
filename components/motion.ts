// Script-driven scrolling honours reduced motion, like the CSS overrides do.
export function scrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}
