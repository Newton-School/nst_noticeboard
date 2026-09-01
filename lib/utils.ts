import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserAvatar(
  email?: string | null,
  fallbackName?: string | null,
  customImage?: string | null
): string {
  if (customImage && customImage.trim() !== "") {
    return customImage;
  }
  const seed =
    email && email.trim() !== ""
      ? email.trim().toLowerCase()
      : fallbackName && fallbackName.trim() !== ""
      ? fallbackName.trim()
      : "Felix";

  return `https://api.dicebear.com/10.x/big-smile/svg?seed=${encodeURIComponent(seed)}`;
}
