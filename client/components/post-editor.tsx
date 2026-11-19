"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { FormMessage } from "@/components/ui/field";
import { UploadButton } from "@/components/upload-button";
import { apiSend } from "@/lib/api.client";
import type { EditablePost, Series } from "@/lib/types";
import { readText, useFormSubmit } from "@/lib/use-form-submit";

type PostEditorProps = {
  post?: EditablePost;
  series: Series[];
};

const parseTags = (value: string) =>
  value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

export function PostEditor({ post, series }: PostEditorProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? null);
  const isPublished = post?.status === "published";

  const { pending, error, notice, onSubmit } = useFormSubmit(async (form) => {
    const status = readText(form, "status");
    const body = {
      title: readText(form, "title"),
      content: readText(form, "content"),
      seriesId: readText(form, "seriesId") || null,
      tags: parseTags(readText(form, "tags")),
      coverImage,
      status,
    };

    if (!post) {
      const created = await apiSend<{ id: string }>("POST", "/me/posts", body);
      router.replace(`/dashboard/posts/${created.id}`);
      return;
    }

    await apiSend("PATCH", `/me/posts/${post.id}`, body);
    router.refresh();
    return status === "published" ? "Published" : "Saved as draft";
  });

  function insertImage(url: string) {
    const textarea = contentRef.current;
    if (!textarea) return;

    textarea.setRangeText(`\n![](${url})\n`, textarea.selectionStart, textarea.selectionEnd, "end");
    textarea.focus();
  }

  async function deletePost() {
    if (!post) return;
    await apiSend("DELETE", `/me/posts/${post.id}`);
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className='mt-10'>
      {coverImage ? (
        <div className='relative mb-8 aspect-[1.91/1] overflow-hidden rounded-xl border bg-muted'>
          <Image
            src={coverImage}
            alt=''
            fill
            sizes='(min-width: 640px) 544px, 100vw'
            className='object-cover'
          />
          <button
            type='button'
            aria-label='Remove cover'
            onClick={() => setCoverImage(null)}
            className='absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-background/90 text-foreground backdrop-blur transition hover:bg-background'>
            <X className='size-4' />
          </button>
        </div>
      ) : (
        <div className='mb-8'>
          <UploadButton onUploaded={setCoverImage}>Add cover</UploadButton>
        </div>
      )}
      <textarea
        name='title'
        defaultValue={post?.title}
        placeholder='Title'
        aria-label='Title'
        rows={1}
        maxLength={200}
        required
        className='w-full resize-none bg-transparent text-[26px] leading-tight font-semibold tracking-tight outline-none field-sizing-content placeholder:text-muted-foreground/50'
      />
      <input
        name='tags'
        defaultValue={post?.tags.join(", ")}
        placeholder='Add up to 5 tags, comma separated'
        aria-label='Tags'
        className='mt-4 w-full bg-transparent text-[13px] text-muted-foreground outline-none placeholder:text-muted-foreground/60'
      />
      <div className='mt-6 flex items-center justify-between gap-4 border-y py-3 text-[13px] text-muted-foreground'>
        <select
          name='seriesId'
          defaultValue={post?.seriesId ?? ""}
          aria-label='Series'
          className='max-w-[45%] truncate bg-transparent outline-none hover:text-foreground'>
          <option value=''>No series</option>
          {series.map((item) => (
            <option
              key={item.id}
              value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <div className='flex items-center gap-4'>
          <UploadButton onUploaded={insertImage}>Image</UploadButton>
          <span>{isPublished ? "Published" : "Draft"}</span>
        </div>
      </div>
      <textarea
        ref={contentRef}
        name='content'
        defaultValue={post?.content}
        placeholder='Tell your story in Markdown...'
        aria-label='Content'
        className='mt-8 min-h-[45vh] w-full resize-none bg-transparent text-[15.5px] leading-[1.75] outline-none field-sizing-content placeholder:text-muted-foreground/50'
      />
      <div className='mt-8 flex flex-wrap items-center gap-3 border-t pt-6'>
        {post && (
          <ConfirmButton
            label='Delete'
            confirmLabel='Confirm delete'
            onConfirm={deletePost}
          />
        )}
        <div className='ml-auto flex items-center gap-2'>
          <FormMessage>{error}</FormMessage>
          <FormMessage tone='success'>{notice}</FormMessage>
          <Button
            type='submit'
            name='status'
            value='draft'
            variant='outline'
            disabled={pending}>
            {isPublished ? "Unpublish" : "Save draft"}
          </Button>
          <Button
            type='submit'
            name='status'
            value='published'
            disabled={pending}>
            {isPublished ? "Update" : "Publish"}
          </Button>
        </div>
      </div>
    </form>
  );
}
