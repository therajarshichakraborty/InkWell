import type { Metadata } from "next";
import { DashboardTabs } from "@/components/dashboard-tabs";
import { Page, PageHeader, PageIntro } from "@/components/page-layout";
import { PostList } from "@/components/post-list";
import { apiGet, requireSession } from "@/lib/api.server";
import type { AuthorPost, PostStatus } from "@/lib/types";
import { formatDate, pluralize } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

type DashboardPageProps = {
  searchParams: Promise<{ status?: PostStatus }>;
};

function postMeta(post: AuthorPost) {
  const timeline =
    post.status === "published" && post.publishedAt
      ? `Published ${formatDate(post.publishedAt)}`
      : `Draft, edited ${formatDate(post.updatedAt)}`;

  return post.series ? [timeline, post.series.name] : [timeline];
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { status } = await searchParams;
  const query = status ? `?${new URLSearchParams({ status })}` : "";
  const [posts, session] = await Promise.all([apiGet<AuthorPost[]>(`/me/posts${query}`), requireSession()]);

  return (
    <Page>
      <PageHeader
        title='Dashboard'
        backHref={`/${session.user.username}`}
        action={{ label: "Settings", href: "/dashboard/settings" }}
      />
      <PageIntro>
        Signed in as {session.user.name}. Drafts stay private until you publish them, and published posts appear on
        your blog instantly.
      </PageIntro>
      <DashboardTabs
        active={status ?? "all"}
        meta={pluralize(posts.length, "post")}
      />
      <PostList
        empty='No posts here yet.'
        items={posts.map((post) => ({
          id: post.id,
          href: `/dashboard/posts/${post.id}`,
          title: post.title,
          excerpt: post.excerpt,
          meta: postMeta(post),
        }))}
      />
    </Page>
  );
}
