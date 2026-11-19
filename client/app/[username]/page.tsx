import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/avatar";
import { FollowButton } from "@/components/follow-button";
import { Page, PageHeader, PageIntro } from "@/components/page-layout";
import { PostList, toPostItem } from "@/components/post-list";
import { Tabs } from "@/components/tabs";
import { apiGet, getSession } from "@/lib/api.server";
import type { Blog, PostSummary } from "@/lib/types";
import { formatMonth, pluralize } from "@/lib/utils";

type BlogPageProps = {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ series?: string }>;
};

const getBlog = (username: string) => apiGet<Blog>(`/users/${encodeURIComponent(username)}`);

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { author } = await getBlog((await params).username);
  return { title: author.name, description: author.bio || undefined };
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { username } = await params;
  const { series } = await searchParams;
  const query = series ? `?${new URLSearchParams({ series })}` : "";

  const [blog, posts, session] = await Promise.all([
    getBlog(username),
    apiGet<PostSummary[]>(`/users/${encodeURIComponent(username)}/posts${query}`),
    getSession(),
  ]);

  const { author, stats, viewer } = blog;
  const blogPath = `/${author.username}`;

  return (
    <Page>
      <PageHeader
        title={author.name}
        backHref='/explore'
        action={{ label: "RSS", href: `/api/users/${author.username}/rss`, external: true }}
      />
      {author.bio && <PageIntro>{author.bio}</PageIntro>}
      <div className='mt-8 flex items-center justify-between gap-4'>
        <div className='flex min-w-0 items-center gap-3'>
          <Avatar
            name={author.name}
            image={author.image}
            size={36}
          />
          <p className='text-[13px] leading-relaxed text-muted-foreground'>
            <span className='text-foreground'>@{author.username}</span>
            <span aria-hidden> · </span>
            {pluralize(stats.followers, "follower")}
            <span aria-hidden> · </span>
            {stats.following} following
            <span className='hidden sm:inline'> · Joined {formatMonth(author.joinedAt)}</span>
          </p>
        </div>
        {viewer.isSelf ? (
          <Link
            href='/dashboard/settings'
            className='shrink-0 text-[13px] text-muted-foreground hover:text-foreground'>
            Edit profile
          </Link>
        ) : (
          <FollowButton
            username={author.username}
            following={viewer.following}
            signedIn={session !== null}
          />
        )}
      </div>
      <Tabs
        meta={pluralize(posts.length, "post")}
        tabs={[
          { label: "All", href: blogPath, active: !series },
          ...blog.series.map((item) => ({
            label: item.name,
            href: `${blogPath}?${new URLSearchParams({ series: item.slug })}`,
            active: item.slug === series,
          })),
        ]}
      />
      <PostList
        empty='No posts published yet.'
        items={posts.map((post) => toPostItem(post, { byline: false }))}
      />
    </Page>
  );
}
