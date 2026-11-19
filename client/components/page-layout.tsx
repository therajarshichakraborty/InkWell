import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function Page({ children }: { children: ReactNode }) {
  return <main className='mx-auto w-full max-w-[34rem] px-4 pt-16 pb-36 sm:pt-24'>{children}</main>;
}

type HeaderAction = {
  label: string;
  href: string;
  external?: boolean;
};

const actionClassName =
  "inline-flex shrink-0 items-center gap-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground";

type PageHeaderProps = {
  title: string;
  backHref?: string;
  action?: HeaderAction;
};

export function PageHeader({ title, backHref, action }: PageHeaderProps) {
  return (
    <header className='relative flex items-center justify-between gap-4'>
      <div className='flex min-w-0 items-center gap-3'>
        {backHref && (
          <Link
            href={backHref}
            aria-label='Back'
            className='grid size-7 shrink-0 place-items-center rounded-md bg-muted text-foreground transition-opacity hover:opacity-70 sm:absolute sm:-left-11'>
            <ArrowLeft className='size-4' />
          </Link>
        )}
        <h1 className='truncate text-[15px] font-medium'>{title}</h1>
      </div>
      {action?.external && (
        <a
          href={action.href}
          target='_blank'
          rel='noreferrer'
          className={actionClassName}>
          {action.label}
          <ArrowUpRight className='size-3' />
        </a>
      )}
      {action && !action.external && (
        <Link
          href={action.href}
          className={actionClassName}>
          {action.label}
          <ArrowUpRight className='size-3' />
        </Link>
      )}
    </header>
  );
}

export function PageIntro({ children }: { children: ReactNode }) {
  return <p className='mt-10 text-[15px] leading-[1.65] text-pretty'>{children}</p>;
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='mt-12'>
      <h2 className='border-b pb-3 text-[15px] font-medium'>{title}</h2>
      <div className='pt-6'>{children}</div>
    </section>
  );
}
