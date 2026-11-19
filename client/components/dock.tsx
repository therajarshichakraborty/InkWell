"use client";

import {
  BookOpen,
  Compass,
  House,
  LayoutGrid,
  LogIn,
  LogOut,
  Moon,
  PenLine,
  Search,
  Sun,
  type LucideIcon,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useRef, useState, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

type DockLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

const SIGN_IN_HREF = "/login";
const MAGNIFY_PX = 14;
const MAGNIFY_RANGE_PX = 130;

const dockVariants: Variants = {
  hidden: { y: 96, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 26, delay: 0.15, staggerChildren: 0.045, delayChildren: 0.25 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 24, scale: 0.4, opacity: 0 },
  visible: { y: 0, scale: 1, opacity: 1, transition: { type: "spring", stiffness: 420, damping: 22 } },
};

const iconClassName = "size-4 sm:size-[18px]";

const subscribeNoop = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );
}

type DockItemProps = {
  label: string;
  mouseX: MotionValue<number>;
  active?: boolean;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
};

function DockItem({ label, mouseX, active = false, href, onClick, children }: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const distance = useTransform(mouseX, (x) => {
    const bounds = ref.current?.getBoundingClientRect();
    return bounds ? x - (bounds.left + bounds.width / 2) : Infinity;
  });
  const extra = useSpring(useTransform(distance, [-MAGNIFY_RANGE_PX, 0, MAGNIFY_RANGE_PX], [0, MAGNIFY_PX, 0]), {
    mass: 0.1,
    stiffness: 180,
    damping: 14,
  });
  const size = useMotionTemplate`calc(var(--dock-size) + ${extra}px)`;
  const iconScale = useTransform(extra, [0, MAGNIFY_PX], [1, 1.18]);

  const content = (
    <>
      {active && (
        <motion.span
          layoutId='dock-active'
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className='absolute -inset-[3px] rounded-full border-[1.5px] border-foreground'
        />
      )}
      <motion.span
        style={{ scale: iconScale }}
        className='grid place-items-center'>
        {children}
      </motion.span>
    </>
  );

  const className =
    "relative grid size-full place-items-center rounded-full border bg-background text-foreground shadow-[0_2px_8px_-2px_rgb(0_0_0/0.12)] transition-colors hover:border-foreground/30";

  return (
    <motion.div
      ref={ref}
      variants={itemVariants}
      style={{ width: size, height: size }}
      whileTap={{ scale: 0.88 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className='relative shrink-0'>
      <AnimatePresence>
        {hovered && (
          <motion.span
            role='tooltip'
            initial={{ opacity: 0, y: 6, scale: 0.85, x: "-50%" }}
            animate={{ opacity: 1, y: 0, scale: 1, x: "-50%" }}
            exit={{ opacity: 0, y: 4, scale: 0.9, x: "-50%" }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className='pointer-events-none absolute bottom-full left-1/2 mb-3 rounded-md bg-foreground px-2 py-1 text-[11px] font-medium whitespace-nowrap text-background'>
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      {href ? (
        <Link
          href={href}
          aria-label={label}
          aria-current={active ? "page" : undefined}
          className={className}>
          {content}
        </Link>
      ) : (
        <button
          type='button'
          aria-label={label}
          onClick={onClick}
          className={className}>
          {content}
        </button>
      )}
    </motion.div>
  );
}

function ThemeIcon() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const dark = mounted && resolvedTheme === "dark";

  return (
    <AnimatePresence
      mode='wait'
      initial={false}>
      <motion.span
        key={dark ? "moon" : "sun"}
        initial={{ rotate: -90, scale: 0, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        exit={{ rotate: 90, scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
        className='grid place-items-center'>
        {dark ? <Moon className={iconClassName} /> : <Sun className={iconClassName} />}
      </motion.span>
    </AnimatePresence>
  );
}

function matches(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function activeHref(pathname: string, hrefs: string[]) {
  return hrefs.filter((href) => matches(pathname, href)).sort((a, b) => b.length - a.length)[0];
}

function linksFor(username: string | null): DockLink[] {
  const shared = [
    { label: "Home", href: "/", icon: House },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Search", href: "/search", icon: Search },
  ];

  if (!username) return [...shared, { label: "Write", href: "/signup", icon: PenLine }];

  return [
    ...shared,
    { label: "My blog", href: `/${username}`, icon: BookOpen },
    { label: "Write", href: "/dashboard/new", icon: PenLine },
    { label: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  ];
}

export function Dock({ username }: { username: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const mouseX = useMotionValue(Infinity);

  const links = linksFor(username);
  const current = activeHref(pathname, [...links.map((link) => link.href), ...(username ? [] : [SIGN_IN_HREF])]);

  function trackPointer(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse") mouseX.set(event.clientX);
  }

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav
      aria-label='Primary'
      className='pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4'>
      <motion.div
        variants={dockVariants}
        initial='hidden'
        animate='visible'
        onPointerMove={trackPointer}
        onPointerLeave={() => mouseX.set(Infinity)}
        className='pointer-events-auto flex h-14 items-end gap-1.5 pb-1 [--dock-size:36px] sm:gap-2 sm:[--dock-size:40px]'>
        {links.map(({ label, href, icon: Icon }) => (
          <DockItem
            key={href}
            label={label}
            href={href}
            mouseX={mouseX}
            active={href === current}>
            <Icon className={iconClassName} />
          </DockItem>
        ))}
        <motion.span
          aria-hidden
          variants={itemVariants}
          className='mx-0.5 mb-2 h-6 w-px shrink-0 bg-border sm:mx-1'
        />
        <DockItem
          label='Toggle theme'
          mouseX={mouseX}
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
          <ThemeIcon />
        </DockItem>
        {username ? (
          <DockItem
            label='Sign out'
            mouseX={mouseX}
            onClick={signOut}>
            <LogOut className={iconClassName} />
          </DockItem>
        ) : (
          <DockItem
            label='Sign in'
            href={SIGN_IN_HREF}
            mouseX={mouseX}
            active={SIGN_IN_HREF === current}>
            <LogIn className={iconClassName} />
          </DockItem>
        )}
      </motion.div>
    </nav>
  );
}
