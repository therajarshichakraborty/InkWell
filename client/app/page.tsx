import Link from "next/link";
import { Hero } from "@/components/landing/hero";
import { apiGet, getSession } from "@/lib/api.server";
import { site } from "@/lib/site";
import type { PlatformStats, PostSummary, Tag } from "@/lib/types";

const fallbackSuggestions = ["@username", "JavaScript", "Node.js", "system design"];

function searchSuggestions(posts: PostSummary[], tags: Tag[]) {
  const usernames = [...new Set(posts.map((post) => `@${post.author.username}`))].slice(0, 3);
  const topics = tags.slice(0, 3).map((tag) => tag.name);
  const suggestions = [...usernames, ...topics];

  return suggestions.length > 0 ? suggestions : fallbackSuggestions;
}

export default async function LandingPage() {
  const [posts, tags, stats, session] = await Promise.all([
    apiGet<PostSummary[]>("/posts"),
    apiGet<Tag[]>("/tags"),
    apiGet<PlatformStats>("/stats"),
    getSession(),
  ]);

  const signedIn = session !== null;

  return (
    <main className='relative'>
      <header className='absolute inset-x-0 top-0 z-10'>
        <div className='mx-auto flex h-16 max-w-5xl items-center justify-between px-4'>
          <Link
            href='/'
            className='text-[15px] font-semibold tracking-tight'>
            {site.name}
          </Link>
          <Link
            href={signedIn ? "/dashboard" : "/login"}
            className='text-[13px] text-muted-foreground transition-colors hover:text-foreground'>
            {signedIn ? "Dashboard" : "Sign in"}
          </Link>
        </div>
      </header>
      <Hero
        postCount={stats.posts}
        suggestions={searchSuggestions(posts, tags)}
        signedIn={signedIn}
      />
    </main>
  );
}
