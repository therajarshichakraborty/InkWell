"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, TextAreaField } from "@/components/ui/field";
import { UploadButton } from "@/components/upload-button";
import { authClient } from "@/lib/auth-client";
import type { SessionUser } from "@/lib/types";
import { readText, useFormSubmit } from "@/lib/use-form-submit";

export function ProfileForm({ user }: { user: SessionUser }) {
  const router = useRouter();
  const [avatarError, setAvatarError] = useState<string | null>(null);

  async function saveAvatar(image: string) {
    const { error } = await authClient.updateUser({ image });
    setAvatarError(error?.message ?? null);
    router.refresh();
  }

  const { pending, error, notice, onSubmit } = useFormSubmit(async (form) => {
    const { error } = await authClient.updateUser({
      name: readText(form, "name"),
      username: readText(form, "username"),
      bio: readText(form, "bio"),
    });

    if (error) throw new Error(error.message ?? "Unable to save profile");
    router.refresh();
    return "Profile saved";
  });

  return (
    <form
      onSubmit={onSubmit}
      className='space-y-5'>
      <div className='flex items-center gap-4'>
        <Avatar
          name={user.name}
          image={user.image}
          size={56}
        />
        <UploadButton onUploaded={saveAvatar}>Change avatar</UploadButton>
        <FormMessage>{avatarError}</FormMessage>
      </div>
      <Field
        label='Email'
        defaultValue={user.email}
        disabled
      />
      <Field
        label='Name'
        name='name'
        defaultValue={user.name}
        required
      />
      <Field
        label='Username'
        name='username'
        defaultValue={user.username}
        pattern='[A-Za-z0-9_]{3,30}'
        hint='Changing it changes your blog address.'
        required
      />
      <TextAreaField
        label='Bio'
        name='bio'
        defaultValue={user.bio}
        maxLength={300}
        placeholder='What do you write about?'
      />
      <div className='flex items-center justify-end gap-3'>
        <FormMessage>{error}</FormMessage>
        <FormMessage tone='success'>{notice}</FormMessage>
        <Button
          type='submit'
          disabled={pending}>
          Save profile
        </Button>
      </div>
    </form>
  );
}
