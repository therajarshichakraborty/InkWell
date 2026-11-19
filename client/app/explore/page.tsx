import type { Metadata } from "next";
import { Page, PageHeader, PageIntro } from "@/components/page-layout";
import { PostList, toPostItem } from "@/components/post-list";
import { TagChips } from "@/components/tag-chips";
import { Tabs } from "@/components/tabs";
import { apiGet, getSession } from "@/lib/api.server";
import type { PostSummary, Tag } from "@/lib/types";
import { pluralize } from "@/lib/utils";

export const metadata: Metadata = { title: "Explore" };

type ExplorePageProps = {
  searchParams: Promise<{ feed?: string }>;
};

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const session = await getSession();
  const following = (await searchParams).feed === "following" && session !== null;

  const [posts, tags] = await Promise.all([
    apiGet<PostSummary[]>(following ? "/me/feed" : "/posts"),
    apiGet<Tag[]>("/tags"),
  ]);

  return (
    <Page>
      <PageHeader
        title='Explore'
        backHref='/'
        action={{ label: "Search", href: "/search" }}
      />
      <PageIntro>Fresh writing from every blog on the platform. Follow writers to build a feed of your own.</PageIntro>
      <TagChips
        tags={tags.slice(0, 10)}
        className='mt-8'
      />
      <Tabs
        meta={pluralize(posts.length, "post")}
        tabs={[
          { label: "Latest", href: "/explore", active: !following },
          ...(session ? [{ label: "Following", href: "/explore?feed=following", active: following }] : []),
        ]}
      />
      <PostList
        empty={following ? "Follow a few writers to fill this feed." : "Nothing published yet."}
        items={posts.map((post) => toPostItem(post, { byline: true }))}
      />
    </Page>
  );
}
