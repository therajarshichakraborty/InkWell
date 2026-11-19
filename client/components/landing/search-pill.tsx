"use client";

import { ArrowRight, Search } from "lucide-react";
import { motion } from "motion/react";
import { ease, useTypewriter } from "./motion-primitives";

export function SearchPill({ suggestions }: { suggestions: string[] }) {
  const typed = useTypewriter(suggestions);

  return (
    <motion.form
      action='/search'
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease, delay: 0.7 }}
      className='group relative mx-auto mt-10 w-full max-w-md'>
      <div className='absolute -inset-px rounded-full bg-[linear-gradient(90deg,transparent,var(--foreground),transparent)] bg-[length:200%_100%] opacity-0 transition-opacity duration-500 group-focus-within:animate-sheen group-focus-within:opacity-40 motion-reduce:animate-none' />
      <label className='relative flex h-12 items-center gap-3 rounded-full border bg-background/80 pr-1.5 pl-5 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.25)] backdrop-blur'>
        <Search className='size-4 shrink-0 text-muted-foreground' />
        <input
          name='q'
          type='search'
          aria-label='Search writers, posts and tags'
          placeholder={`Search ${typed}`}
          className='h-full w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground'
        />
        <button
          type='submit'
          aria-label='Search'
          className='grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-background transition group-hover:translate-x-0.5 active:scale-95'>
          <ArrowRight className='size-4' />
        </button>
      </label>
    </motion.form>
  );
}
