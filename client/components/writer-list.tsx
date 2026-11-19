import Link from "next/link";
import { Avatar } from "@/components/avatar";
import type { Author } from "@/lib/types";

export function WriterList({ writers, empty }: { writers: Author[]; empty: string }) {
  if (writers.length === 0) {
    return <p className='py-16 text-center text-[13px] text-muted-foreground'>{empty}</p>;
  }

  return (
    <ul className='divide-y'>
      {writers.map((writer) => (
        <li key={writer.username}>
          <Link
            href={`/${writer.username}`}
            className='group flex items-start gap-4 py-6'>
            <Avatar
              name={writer.name}
              image={writer.image}
              size={40}
            />
            <div className='min-w-0'>
              <p className='flex flex-wrap items-baseline gap-x-2'>
                <span className='text-[15px] font-medium decoration-1 underline-offset-4 group-hover:underline'>
                  {writer.name}
                </span>
                <span className='text-[13px] text-muted-foreground'>@{writer.username}</span>
              </p>
              {writer.bio && (
                <p className='mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-muted-foreground'>{writer.bio}</p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
