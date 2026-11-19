import Link from "next/link";
import { Avatar } from "@/components/avatar";
import type { AuthorRef, PostSummary } from "@/lib/types";
import { formatDate, pluralize } from "@/lib/utils";

export type PostListItem = {
  id: string;
  href: string;
  title: string;
  excerpt: string;
  meta: string[];
  author?: AuthorRef;
};

export function toPostItem(post: PostSummary, { byline }: { byline: boolean }): PostListItem {
  const context = byline ? post.author.name : post.series?.name;

  return {
    id: post.id,
    href: `/${post.author.username}/${post.slug}`,
    title: post.title,
    excerpt: post.excerpt,
    author: byline ? post.author : undefined,
    meta: [
      formatDate(post.publishedAt),
      ...(context ? [context] : []),
      ...(post.likeCount > 0 ? [pluralize(post.likeCount, "like")] : []),
      ...(post.commentCount > 0 ? [pluralize(post.commentCount, "comment")] : []),
    ],
  };
}

export function PostList({ items, empty }: { items: PostListItem[]; empty: string }) {
  if (items.length === 0) {
    return <p className='py-16 text-center text-[13px] text-muted-foreground'>{empty}</p>;
  }

  return (
    <ol className='divide-y'>
      {items.map((item, index) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className='group grid grid-cols-[2rem_1fr] gap-x-4 py-8 sm:grid-cols-[2.25rem_1fr] sm:gap-x-5'>
            <span className='pt-1 font-mono text-[11px] text-muted-foreground tabular-nums'>
              {String(index + 1).padStart(2, "0")}.
            </span>
            <div className='min-w-0'>
              <h2 className='text-[17px] leading-snug font-medium text-balance decoration-1 underline-offset-4 group-hover:underline'>
                {item.title}
              </h2>
              {item.excerpt && (
                <p className='mt-2.5 line-clamp-3 text-[15px] leading-[1.65] text-muted-foreground'>
                  {item.excerpt}
                </p>
              )}
              <div className='mt-3 flex flex-wrap items-center gap-x-2 text-[12.5px] text-muted-foreground'>
                {item.author && (
                  <Avatar
                    name={item.author.name}
                    image={item.author.image}
                    size={18}
                  />
                )}
                {item.meta.map((part, position) => (
                  <span
                    key={position}
                    className='flex items-center gap-x-2'>
                    {position > 0 && <span aria-hidden>·</span>}
                    {part}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}
