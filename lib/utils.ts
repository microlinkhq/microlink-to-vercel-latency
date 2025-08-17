import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timestamp() {
  const timestamp = Date.now()
  return () =>  Date.now() - timestamp
}