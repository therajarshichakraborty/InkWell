"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { formatCompact } from "@/lib/utils";
import { ease, RotatingWords, WordsReveal } from "./motion-primitives";
import { SearchPill } from "./search-pill";

type HeroProps = {
  postCount: number;
  suggestions: string[];
  signedIn: boolean;
};

const rotatingWords = ["explain clearly.", "teach deeply.", "ship stories.", "build in public."];

export function Hero({ postCount, suggestions, signedIn }: HeroProps) {
  return (
    <section className='mx-auto flex min-h-dvh max-w-5xl flex-col items-center justify-center px-4 pt-20 pb-32 text-center'>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}>
        <Link
          href='/explore'
          className='group inline-flex items-center gap-2 rounded-full border bg-background py-1 pr-3 pl-1.5 text-[12.5px] text-muted-foreground transition-colors hover:text-foreground'>
          <span className='relative flex size-5 items-center justify-center'>
            <span className='absolute size-2 animate-ping rounded-full bg-foreground/40 motion-reduce:animate-none' />
            <span className='size-2 rounded-full bg-foreground' />
          </span>
          {formatCompact(postCount)} stories published
          <ArrowRight className='size-3 transition-transform group-hover:translate-x-0.5' />
        </Link>
      </motion.div>
      <h1 className='mt-8 text-[44px] leading-[1.02] font-semibold tracking-[-0.045em] sm:text-[76px]'>
        <WordsReveal
          text='A quiet place to'
          delay={0.1}
        />
        <br />
        <RotatingWords words={rotatingWords} />
      </h1>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.5 }}
        className='mt-6 max-w-xl text-[16px] leading-relaxed text-pretty text-muted-foreground sm:text-[17px]'>
        A minimal blogging platform for developers. Markdown, series, tags and images, with readers who follow, like,
        bookmark and comment.
      </motion.p>
      <SearchPill suggestions={suggestions} />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.85 }}
        className='mt-6 flex items-center justify-center gap-3'>
        <Link
          href={signedIn ? "/dashboard/new" : "/signup"}
          className='relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-full bg-foreground px-6 text-[14px] font-medium text-background transition active:scale-[0.98]'>
          <span className='absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-[linear-gradient(90deg,transparent,color-mix(in_oklab,var(--background)_35%,transparent),transparent)] motion-reduce:hidden' />
          {signedIn ? "Write a post" : "Start writing free"}
          <ArrowRight className='size-4' />
        </Link>
        <Link
          href='/explore'
          className='inline-flex h-11 items-center rounded-full border bg-background px-6 text-[14px] font-medium transition hover:border-foreground/40'>
          Explore
        </Link>
      </motion.div>
    </section>
  );
}
