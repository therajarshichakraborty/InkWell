"use client";

import { ImagePlus } from "lucide-react";
import { useRef, useState, useTransition, type ChangeEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/field";
import { uploadImage } from "@/lib/api.client";
import { errorMessage } from "@/lib/utils";

type UploadButtonProps = {
  children: ReactNode;
  onUploaded: (url: string) => void;
};

export function UploadButton({ children, onUploaded }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setError(null);
    startTransition(async () => {
      try {
        onUploaded(await uploadImage(file));
      } catch (cause) {
        setError(errorMessage(cause));
      }
    });
  }

  return (
    <span className='inline-flex items-center gap-3'>
      <input
        ref={inputRef}
        type='file'
        accept='image/png,image/jpeg,image/gif,image/webp'
        className='hidden'
        onChange={handleChange}
      />
      <Button
        variant='outline'
        disabled={pending}
        onClick={() => inputRef.current?.click()}>
        <ImagePlus className='mr-1.5 size-3.5' />
        {pending ? "Uploading..." : children}
      </Button>
      <FormMessage>{error}</FormMessage>
    </span>
  );
}
