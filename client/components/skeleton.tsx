import { cn } from "@/lib/utils";
import { Page } from "./page-layout";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export function PageSkeleton() {
  return (
    <Page>
      <div
        role='status'
        aria-label='Loading'>
        <Skeleton className='h-5 w-40' />
        <Skeleton className='mt-12 h-7 w-3/4' />
        <Skeleton className='mt-5 h-4 w-1/2' />
        <div className='mt-12 space-y-8'>
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className='space-y-2.5'>
              <Skeleton className='h-4 w-2/3' />
              <Skeleton className='h-3.5 w-full' />
              <Skeleton className='h-3.5 w-5/6' />
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

export function CommentsSkeleton() {
  return (
    <div
      className='mt-16'
      role='status'
      aria-label='Loading comments'>
      <Skeleton className='h-4 w-28' />
      <Skeleton className='mt-6 h-20 w-full' />
    </div>
  );
}
