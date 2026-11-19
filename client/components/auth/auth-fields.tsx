"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { authItem } from "./auth-shell";

const inputClassName =
  "h-11 w-full rounded-xl border bg-background px-3.5 text-[15px] outline-none transition placeholder:text-muted-foreground/60 focus:border-foreground/40 focus:ring-4 focus:ring-foreground/[0.06]";

type FieldShellProps = {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
};

function FieldShell({ label, hint, children }: FieldShellProps) {
  return (
    <motion.label
      variants={authItem}
      className='block'>
      <span className='text-[13px] font-medium'>{label}</span>
      <div className='relative mt-2'>{children}</div>
      {hint && <span className='mt-1.5 block text-[12px] text-muted-foreground'>{hint}</span>}
    </motion.label>
  );
}

type InputFieldProps = ComponentProps<"input"> & {
  label: string;
  hint?: ReactNode;
};

export function InputField({ label, hint, className, ...props }: InputFieldProps) {
  return (
    <FieldShell
      label={label}
      hint={hint}>
      <input
        className={cn(inputClassName, className)}
        {...props}
      />
    </FieldShell>
  );
}

export function PasswordField({ label, hint, ...props }: InputFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <FieldShell
      label={label}
      hint={hint}>
      <input
        type={visible ? "text" : "password"}
        className={cn(inputClassName, "pr-11")}
        {...props}
      />
      <button
        type='button'
        aria-label={visible ? "Hide password" : "Show password"}
        onClick={() => setVisible(!visible)}
        className='absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground'>
        <AnimatePresence
          mode='wait'
          initial={false}>
          <motion.span
            key={visible ? "hide" : "show"}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}>
            {visible ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
          </motion.span>
        </AnimatePresence>
      </button>
    </FieldShell>
  );
}

export function AuthError({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          role='alert'
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto", x: [0, -6, 6, -4, 4, 0] }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4 }}
          className='overflow-hidden rounded-xl border border-danger/20 bg-danger/5 px-3.5 py-2.5 text-[13px] text-danger'>
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function AuthSubmit({ pending, children }: { pending: boolean; children: ReactNode }) {
  return (
    <motion.button
      variants={authItem}
      type='submit'
      disabled={pending}
      whileTap={{ scale: 0.98 }}
      className='relative flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-foreground text-[14px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-70'>
      <span className='absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--background)_30%,transparent),transparent)] motion-reduce:hidden' />
      {pending && <Loader2 className='size-4 animate-spin' />}
      {children}
    </motion.button>
  );
}
