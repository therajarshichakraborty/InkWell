import Link from "next/link";
import { cn } from "@/lib/utils";

export type Tab = {
  label: string;
  href: string;
  active: boolean;
};

export function Tabs({ tabs, meta }: { tabs: Tab[]; meta: string }) {
  return (
    <nav className='mt-12 flex items-end justify-between gap-6 border-b'>
      <div className='-mb-px flex min-w-0 gap-6 overflow-x-auto [scrollbar-width:none]'>
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={tab.active ? "page" : undefined}
            className={cn(
              "shrink-0 border-b-2 pb-3 text-[15px] whitespace-nowrap transition-colors",
              tab.active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}>
            {tab.label}
          </Link>
        ))}
      </div>
      <span className='shrink-0 pb-3 text-[13px] text-muted-foreground'>{meta}</span>
    </nav>
  );
}
