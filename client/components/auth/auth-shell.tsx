"use client";

import { motion, type Variants } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ease } from "@/components/landing/motion-primitives";
import { site } from "@/lib/site";

export const authStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

export const authItem: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease } },
};

type AuthShellProps = {
  title: string;
  description: string;
  footer: ReactNode;
  children: ReactNode;
};

export function AuthShell({ title, description, footer, children }: AuthShellProps) {
  return (
    <main className='flex min-h-dvh flex-col items-center justify-center px-4 pt-16 pb-32'>
      <motion.div
        variants={authStagger}
        initial='hidden'
        animate='visible'
        className='w-full max-w-[22rem]'>
        <motion.div variants={authItem}>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-[14px] font-semibold tracking-tight'>
            <span className='grid size-7 place-items-center rounded-lg bg-foreground text-[13px] text-background'>
              {site.name[0]}
            </span>
            {site.name}
          </Link>
        </motion.div>
        <motion.h1
          variants={authItem}
          className='mt-10 text-[30px] leading-tight font-semibold tracking-[-0.03em]'>
          {title}
        </motion.h1>
        <motion.p
          variants={authItem}
          className='mt-2 text-[14.5px] leading-relaxed text-muted-foreground'>
          {description}
        </motion.p>
        {children}
        <motion.p
          variants={authItem}
          className='mt-8 text-center text-[13px] text-muted-foreground'>
          {footer}
        </motion.p>
      </motion.div>
    </main>
  );
}
