"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export const ease = [0.16, 1, 0.3, 1] as const;

export function WordsReveal({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={className}>
      {text.split(" ").map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          initial={{ opacity: 0, y: "0.4em", filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease, delay: delay + index * 0.08 }}
          className='inline-block whitespace-pre'>
          {index > 0 ? ` ${word}` : word}
        </motion.span>
      ))}
    </span>
  );
}

export function RotatingWords({ words, interval = 2600 }: { words: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((current) => (current + 1) % words.length), interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className='relative inline-grid overflow-hidden pb-[0.12em] align-bottom'>
      <AnimatePresence
        mode='popLayout'
        initial={false}>
        <motion.span
          key={words[index]}
          initial={{ y: "100%", opacity: 0, filter: "blur(8px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-100%", opacity: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.7, ease }}
          className='animate-sheen bg-[linear-gradient(110deg,var(--foreground)_35%,var(--muted-foreground)_50%,var(--foreground)_65%)] bg-[length:200%_100%] bg-clip-text px-[0.08em] whitespace-nowrap text-transparent motion-reduce:animate-none'>
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function useTypewriter(phrases: string[], { typeMs = 70, deleteMs = 35, holdMs = 1500 } = {}) {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = phrases[phraseIndex % phrases.length] ?? "";
    const finished = !deleting && text === phrase;
    const emptied = deleting && text === "";
    const stepMs = deleting ? deleteMs : typeMs;

    const timer = setTimeout(
      () => {
        if (finished) return setDeleting(true);
        if (emptied) {
          setDeleting(false);
          setPhraseIndex((current) => current + 1);
          return;
        }
        setText(phrase.slice(0, text.length + (deleting ? -1 : 1)));
      },
      finished ? holdMs : stepMs,
    );

    return () => clearTimeout(timer);
  }, [text, deleting, phraseIndex, phrases, typeMs, deleteMs, holdMs]);

  return text;
}
