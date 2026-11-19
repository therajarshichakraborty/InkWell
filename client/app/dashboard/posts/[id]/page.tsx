import type { Metadata } from "next";
import { Page, PageHeader } from "@/components/page-layout";
import { PostEditor } from "@/components/post-editor";
import { apiGet, requireSession } from "@/lib/api.server";
import type { EditablePost, Series } from "@/lib/types";

export const metadata: Metadata = { title: "Edit post" };

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const [post, series, session] = await Promise.all([
    apiGet<EditablePost>(`/me/posts/${encodeURIComponent(id)}`),
    apiGet<Series[]>("/me/series"),
    requireSession(),
  ]);

  return (
    <Page>
      <PageHeader
        title='Edit post'
        backHref='/dashboard'
        action={
          post.status === "published"
            ? { label: "View post", href: `/${session.user.username}/${post.slug}` }
            : undefined
        }
      />
      <PostEditor
        key={post.id}
        post={post}
        series={series}
      />
    </Page>
  );
}
