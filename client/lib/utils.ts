import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

const monthFormat = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

const compactFormat = new Intl.NumberFormat("en-US", { notation: "compact" });

export function formatDate(value: string) {
  return dateFormat.format(new Date(value));
}

export function formatMonth(value: string) {
  return monthFormat.format(new Date(value));
}

export function formatCompact(value: number) {
  return compactFormat.format(value);
}

export function pluralize(count: number, noun: string) {
  return `${formatCompact(count)} ${noun}${count === 1 ? "" : "s"}`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}
