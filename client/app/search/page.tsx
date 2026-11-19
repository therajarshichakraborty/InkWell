import { Search } from "lucide-react";
import type { Metadata } from "next";
import { Page, PageHeader } from "@/components/page-layout";
import { PostList, toPostItem } from "@/components/post-list";
import { TagChips } from "@/components/tag-chips";
import { Tabs } from "@/components/tabs";
import { WriterList } from "@/components/writer-list";
import { apiGet } from "@/lib/api.server";
import type { SearchResults } from "@/lib/types";

export const metadata: Metadata = { title: "Search" };

type SearchPageProps = {
  searchParams: Promise<{ q?: string; type?: string }>;
};

const resultTypes = [
  { type: "writers", label: "Writers" },
  { type: "posts", label: "Posts" },
  { type: "tags", label: "Tags" },
] as const;

type ResultType = (typeof resultTypes)[number]["type"];

const emptyResults: SearchResults = { users: [], posts: [], tags: [] };

function countFor(results: SearchResults, type: ResultType) {
  if (type === "writers") return results.users.length;
  if (type === "posts") return results.posts.length;
  return results.tags.length;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", type } = await searchParams;
  const query = q.trim();
  const active: ResultType = resultTypes.find((item) => item.type === type)?.type ?? "writers";
  const results = query ? await apiGet<SearchResults>(`/search?${new URLSearchParams({ q: query })}`) : emptyResults;

  return (
    <Page>
      <PageHeader
        title='Search'
        backHref='/explore'
      />
      <form
        action='/search'
        className='mt-10'>
        <label className='flex h-12 items-center gap-3 rounded-full border bg-background px-5 transition-colors focus-within:border-foreground/50'>
          <Search className='size-4 shrink-0 text-muted-foreground' />
          <input
            name='q'
            type='search'
            defaultValue={query}
            placeholder='Search writers by @username, posts or tags'
            aria-label='Search'
            autoFocus
            className='h-full w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground/70'
          />
        </label>
        <input
          type='hidden'
          name='type'
          value={active}
        />
      </form>
      {query && (
        <>
          <Tabs
            meta={`"${query}"`}
            tabs={resultTypes.map((item) => ({
              label: `${item.label} ${countFor(results, item.type)}`,
              href: `/search?${new URLSearchParams({ q: query, type: item.type })}`,
              active: item.type === active,
            }))}
          />
          {active === "writers" && (
            <WriterList
              writers={results.users}
              empty='No writers match that name.'
            />
          )}
          {active === "posts" && (
            <PostList
              empty='No posts match that title.'
              items={results.posts.map((post) => toPostItem(post, { byline: true }))}
            />
          )}
          {active === "tags" && (
            <TagChips
              tags={results.tags}
              className='py-8'
            />
          )}
          {active === "tags" && results.tags.length === 0 && (
            <p className='py-16 text-center text-[13px] text-muted-foreground'>No tags match that name.</p>
          )}
        </>
      )}
      {!query && (
        <p className='mt-6 text-[13px] text-muted-foreground'>
          Try a username like @ada, a topic like JavaScript, or a few words from a title.
        </p>
      )}
    </Page>
  );
}
