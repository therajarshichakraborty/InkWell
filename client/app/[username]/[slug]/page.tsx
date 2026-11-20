import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Avatar } from "@/components/avatar";
import { Comments } from "@/components/comments";
import { Page, PageHeader } from "@/components/page-layout";
import { PostActions } from "@/components/post-actions";
import { CommentsSkeleton } from "@/components/skeleton";
import { TagChips } from "@/components/tag-chips";
import { apiGet, getSession } from "@/lib/api.server";
import type { Comment, Post, Session } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type PostPageProps = {
  params: Promise<{ username: string; slug: string }>;
};

async function getPost(params: PostPageProps["params"]) {
  const { username, slug } = await params;
  return apiGet<Post>(`/users/${encodeURIComponent(username)}/posts/${encodeURIComponent(slug)}`);
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPost(params);
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: post.coverImage ? { images: [post.coverImage] } : undefined,
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const [post, session] = await Promise.all([getPost(params), getSession()]);
  const blogPath = `/${post.author.username}`;

  return (
    <Page>
      <PageHeader
        title={post.author.name}
        backHref={blogPath}
        action={
          post.series
            ? { label: post.series.name, href: `${blogPath}?${new URLSearchParams({ series: post.series.slug })}` }
            : undefined
        }
      />
      <article className='mt-12'>
        {post.coverImage && (
          <div className='relative mb-10 aspect-[1.91/1] overflow-hidden rounded-xl border bg-muted'>
            <Image
              src={post.coverImage}
              alt=''
              fill
              priority
              sizes='(min-width: 640px) 544px, 100vw'
              className='object-cover'
            />
          </div>
        )}
        <h1 className='text-[26px] leading-tight font-semibold tracking-tight text-balance'>{post.title}</h1>
        <div className='mt-5 flex items-center gap-3 text-[13px] text-muted-foreground'>
          <Avatar
            name={post.author.name}
            image={post.author.image}
            size={28}
          />
          <Link
            href={blogPath}
            className='text-foreground hover:underline'>
            {post.author.name}
          </Link>
          <span aria-hidden>·</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span>{post.readingTime} min read</span>
        </div>
        <div
          className='prose mt-10 max-w-none text-[15.5px] leading-[1.75] text-foreground prose-neutral dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-a:underline-offset-4 prose-code:before:content-none prose-code:after:content-none prose-pre:rounded-lg prose-pre:border prose-pre:bg-muted prose-pre:text-foreground prose-img:rounded-lg'
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        <TagChips
          tags={post.tags}
          className='mt-10'
        />
        <div className='mt-10 border-t pt-6'>
          <PostActions
            postId={post.id}
            liked={post.liked}
            likeCount={post.likeCount}
            commentCount={post.commentCount}
            bookmarked={post.bookmarked}
            signedIn={session !== null}
          />
        </div>
      </article>
      <Suspense fallback={<CommentsSkeleton />}>
        <PostComments
          post={post}
          session={session}
        />
      </Suspense>
    </Page>
  );
}

// Streamed separately so the article renders without waiting on the comments request.
async function PostComments({ post, session }: { post: Post; session: Session | null }) {
  const comments = await apiGet<Comment[]>(`/posts/${post.id}/comments`);

  return (
    <Comments
      postId={post.id}
      comments={comments}
      viewer={session ? { name: session.user.name, username: session.user.username, image: session.user.image } : null}
      postAuthorUsername={post.author.username}
    />
  );
}
