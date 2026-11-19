import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const controlClassName =
  "w-full rounded-lg border bg-background px-3 text-[15px] outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground/50";

type FieldProps = {
  label: string;
  hint?: string;
};

export function Field({ label, hint, className, ...props }: FieldProps & ComponentProps<"input">) {
  return (
    <label className='block'>
      <span className='text-[13px] text-muted-foreground'>{label}</span>
      <input
        className={cn(controlClassName, "mt-2 h-10", className)}
        {...props}
      />
      {hint && <span className='mt-1.5 block text-[12px] text-muted-foreground'>{hint}</span>}
    </label>
  );
}

export function TextAreaField({ label, hint, className, ...props }: FieldProps & ComponentProps<"textarea">) {
  return (
    <label className='block'>
      <span className='text-[13px] text-muted-foreground'>{label}</span>
      <textarea
        className={cn(controlClassName, "mt-2 min-h-24 resize-none py-2.5 leading-relaxed field-sizing-content", className)}
        {...props}
      />
      {hint && <span className='mt-1.5 block text-[12px] text-muted-foreground'>{hint}</span>}
    </label>
  );
}

export function FormMessage({ tone = "error", children }: { tone?: "error" | "success"; children: string | null }) {
  if (!children) return null;

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn("text-[13px]", tone === "error" ? "text-danger" : "text-muted-foreground")}>
      {children}
    </p>
  );
}
