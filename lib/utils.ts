import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function estimateOilPrice(liters: number) {
  const baseRate = 5200;
  const volumeBonus = liters >= 25 ? 1.12 : liters >= 10 ? 1.06 : 1;
  return Math.round(liters * baseRate * volumeBonus);
}
