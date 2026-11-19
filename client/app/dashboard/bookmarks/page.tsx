import type { Metadata } from "next";
import { DashboardTabs } from "@/components/dashboard-tabs";
import { Page, PageHeader, PageIntro } from "@/components/page-layout";
import { PostList, toPostItem } from "@/components/post-list";
import { apiGet } from "@/lib/api.server";
import type { PostSummary } from "@/lib/types";
import { pluralize } from "@/lib/utils";

export const metadata: Metadata = { title: "Saved" };

export default async function BookmarksPage() {
  const posts = await apiGet<PostSummary[]>("/me/bookmarks");

  return (
    <Page>
      <PageHeader
        title='Dashboard'
        backHref='/explore'
        action={{ label: "Settings", href: "/dashboard/settings" }}
      />
      <PageIntro>Posts you saved to read later. Bookmark any article from its page.</PageIntro>
      <DashboardTabs
        active='saved'
        meta={pluralize(posts.length, "post")}
      />
      <PostList
        empty='Nothing saved yet.'
        items={posts.map((post) => toPostItem(post, { byline: true }))}
      />
    </Page>
  );
}
