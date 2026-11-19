"use client";

import { Bookmark, Heart, Link2, MessageCircle, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition, type ComponentProps } from "react";
import { apiSend } from "@/lib/api.client";
import { cn, formatCompact } from "@/lib/utils";

type PostActionsProps = {
  postId: string;
  liked: boolean;
  likeCount: number;
  commentCount: number;
  bookmarked: boolean;
  signedIn: boolean;
};

const actionClassName =
  "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] text-muted-foreground transition hover:border-foreground/40 hover:text-foreground active:scale-95";

type ActionProps = ComponentProps<"button"> & {
  icon: LucideIcon;
  active?: boolean;
  label: string;
};

function Action({ icon: Icon, active = false, label, children, className, ...props }: ActionProps) {
  return (
    <button
      type='button'
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(actionClassName, active && "border-foreground text-foreground", className)}
      {...props}>
      <Icon className={cn("size-4", active && "fill-current")} />
      {children}
    </button>
  );
}

export function PostActions({ postId, liked, likeCount, commentCount, bookmarked, signedIn }: PostActionsProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [state, setState] = useOptimistic({ liked, likeCount, bookmarked });

  function requireSignIn() {
    if (!signedIn) router.push("/login");
    return signedIn;
  }

  function toggleLike() {
    if (!requireSignIn()) return;

    startTransition(async () => {
      setState({ ...state, liked: !state.liked, likeCount: state.likeCount + (state.liked ? -1 : 1) });
      await apiSend(state.liked ? "DELETE" : "PUT", `/posts/${postId}/like`);
      router.refresh();
    });
  }

  function toggleBookmark() {
    if (!requireSignIn()) return;

    startTransition(async () => {
      setState({ ...state, bookmarked: !state.bookmarked });
      await apiSend(state.bookmarked ? "DELETE" : "PUT", `/posts/${postId}/bookmark`);
      router.refresh();
    });
  }

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className='flex flex-wrap items-center gap-2'>
      <Action
        icon={Heart}
        label={state.liked ? "Unlike" : "Like"}
        active={state.liked}
        onClick={toggleLike}>
        {formatCompact(state.likeCount)}
      </Action>
      <a
        href='#comments'
        className={actionClassName}>
        <MessageCircle className='size-4' />
        {formatCompact(commentCount)}
      </a>
      <Action
        icon={Bookmark}
        label={state.bookmarked ? "Remove bookmark" : "Bookmark"}
        active={state.bookmarked}
        onClick={toggleBookmark}
      />
      <Action
        icon={Link2}
        label='Copy link'
        className='ml-auto'
        onClick={copyLink}>
        {copied ? "Copied" : "Share"}
      </Action>
    </div>
  );
}
