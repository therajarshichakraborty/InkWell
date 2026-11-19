"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { apiSend } from "@/lib/api.client";

type FollowButtonProps = {
  username: string;
  following: boolean;
  signedIn: boolean;
};

export function FollowButton({ username, following, signedIn }: FollowButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticFollowing, setOptimisticFollowing] = useOptimistic(following);

  if (!signedIn) {
    return (
      <Link
        href='/login'
        className='inline-flex h-9 items-center rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition hover:opacity-85'>
        Follow
      </Link>
    );
  }

  function toggle() {
    startTransition(async () => {
      setOptimisticFollowing(!optimisticFollowing);
      await apiSend(optimisticFollowing ? "DELETE" : "PUT", `/users/${username}/follow`);
      router.refresh();
    });
  }

  return (
    <Button
      variant={optimisticFollowing ? "outline" : "primary"}
      disabled={pending}
      onClick={toggle}>
      {optimisticFollowing ? "Following" : "Follow"}
    </Button>
  );
}
