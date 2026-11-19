import type { Metadata } from "next";
import { Page, PageHeader, PageIntro } from "@/components/page-layout";
import { PostList, toPostItem } from "@/components/post-list";
import { Tabs } from "@/components/tabs";
import { apiGet } from "@/lib/api.server";
import type { TagPage } from "@/lib/types";
import { pluralize } from "@/lib/utils";

type TagPageProps = {
  params: Promise<{ slug: string }>;
};

async function getTag(params: TagPageProps["params"]) {
  return apiGet<TagPage>(`/tags/${encodeURIComponent((await params).slug)}`);
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { tag } = await getTag(params);
  return { title: `#${tag.name}` };
}

export default async function TagPostsPage({ params }: TagPageProps) {
  const { tag, posts } = await getTag(params);

  return (
    <Page>
      <PageHeader
        title={`#${tag.name}`}
        backHref='/explore'
      />
      <PageIntro>Everything published under #{tag.name}, newest first.</PageIntro>
      <Tabs
        meta={pluralize(posts.length, "post")}
        tabs={[{ label: "Latest", href: `/tags/${tag.slug}`, active: true }]}
      />
      <PostList
        empty='No posts with this tag yet.'
        items={posts.map((post) => toPostItem(post, { byline: true }))}
      />
    </Page>
  );
}
