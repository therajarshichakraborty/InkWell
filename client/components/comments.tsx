"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { FormMessage } from "@/components/ui/field";
import { apiSend } from "@/lib/api.client";
import type { Comment } from "@/lib/types";
import { readText, useFormSubmit } from "@/lib/use-form-submit";
import { formatDate } from "@/lib/utils";

type CommentsProps = {
  postId: string;
  comments: Comment[];
  viewerUsername: string | null;
  postAuthorUsername: string;
};

export function Comments({ postId, comments, viewerUsername, postAuthorUsername }: CommentsProps) {
  const router = useRouter();
  const { pending, error, onSubmit } = useFormSubmit(async (form, element) => {
    await apiSend("POST", `/posts/${postId}/comments`, { content: readText(form, "content") });
    element.reset();
    router.refresh();
  });

  async function removeComment(id: string) {
    await apiSend("DELETE", `/comments/${id}`);
    router.refresh();
  }

  const canRemove = (comment: Comment) =>
    viewerUsername === comment.author.username || viewerUsername === postAuthorUsername;

  return (
    <section
      id='comments'
      className='mt-16 scroll-mt-24'>
      <h2 className='border-b pb-3 text-[15px] font-medium'>
        Comments <span className='text-muted-foreground'>{comments.length}</span>
      </h2>
      {viewerUsername ? (
        <form
          onSubmit={onSubmit}
          className='mt-6'>
          <textarea
            name='content'
            placeholder='Add to the discussion'
            aria-label='Comment'
            maxLength={2000}
            required
            className='min-h-20 w-full resize-none rounded-lg border bg-background px-3 py-2.5 text-[15px] leading-relaxed outline-none field-sizing-content placeholder:text-muted-foreground/70 focus:border-foreground/50'
          />
          <div className='mt-3 flex items-center justify-end gap-3'>
            <FormMessage>{error}</FormMessage>
            <Button
              type='submit'
              disabled={pending}>
              Comment
            </Button>
          </div>
        </form>
      ) : (
        <p className='mt-6 text-[13px] text-muted-foreground'>
          <Link
            href='/login'
            className='text-foreground underline-offset-4 hover:underline'>
            Sign in
          </Link>{" "}
          to join the discussion.
        </p>
      )}
      <ul className='mt-4 divide-y'>
        <AnimatePresence initial={false}>
          {comments.map((comment) => (
            <motion.li
              key={comment.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className='py-5'>
              <div className='flex items-center gap-2.5 text-[13px]'>
                <Avatar
                  name={comment.author.name}
                  image={comment.author.image}
                  size={24}
                />
                <Link
                  href={`/${comment.author.username}`}
                  className='font-medium hover:underline'>
                  {comment.author.name}
                </Link>
                <span className='text-muted-foreground'>{formatDate(comment.createdAt)}</span>
                {canRemove(comment) && (
                  <span className='ml-auto'>
                    <ConfirmButton
                      label='Delete'
                      confirmLabel='Confirm'
                      onConfirm={() => removeComment(comment.id)}
                    />
                  </span>
                )}
              </div>
              <p className='mt-2.5 pl-[34px] text-[15px] leading-relaxed whitespace-pre-line'>{comment.content}</p>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
