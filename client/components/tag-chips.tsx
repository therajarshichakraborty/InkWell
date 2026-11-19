import Link from "next/link";
import type { TagRef } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TagChips({ tags, className }: { tags: (TagRef & { postCount?: number })[]; className?: string }) {
  if (tags.length === 0) return null;

  return (
    <ul className={cn("flex flex-wrap gap-2", className)}>
      {tags.map((tag) => (
        <li key={tag.slug}>
          <Link
            href={`/tags/${tag.slug}`}
            className='inline-flex h-7 items-center gap-1.5 rounded-full border px-3 text-[12.5px] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground'>
            <span aria-hidden>#</span>
            {tag.name}
            {tag.postCount !== undefined && <span className='text-muted-foreground/60'>{tag.postCount}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
