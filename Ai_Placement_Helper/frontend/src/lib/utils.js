// Remove imports of clsx and twMerge
// import { clsx } from "clsx";
// import { twMerge } from "tailwind-merge";

/**
 * Utility function for conditional className merging
 * This is a simplified version that doesn't use clsx or tailwind-merge
 */
export function cn(...inputs) {
  // Filter out falsy values and join with spaces
  return inputs.filter(Boolean).join(" ");
} 