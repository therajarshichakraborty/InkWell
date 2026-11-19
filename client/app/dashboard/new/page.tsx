import type { Metadata } from "next";
import { Page, PageHeader } from "@/components/page-layout";
import { PostEditor } from "@/components/post-editor";
import { apiGet } from "@/lib/api.server";
import type { Series } from "@/lib/types";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage() {
  const series = await apiGet<Series[]>("/me/series");

  return (
    <Page>
      <PageHeader
        title='New post'
        backHref='/dashboard'
      />
      <PostEditor series={series} />
    </Page>
  );
}
