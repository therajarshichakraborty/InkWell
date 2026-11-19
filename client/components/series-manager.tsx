"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { FormMessage } from "@/components/ui/field";
import { apiSend } from "@/lib/api.client";
import type { Series } from "@/lib/types";
import { readText, useFormSubmit } from "@/lib/use-form-submit";
import { pluralize } from "@/lib/utils";

export function SeriesManager({ series }: { series: Series[] }) {
  const router = useRouter();
  const { pending, error, onSubmit } = useFormSubmit(async (form, element) => {
    await apiSend("POST", "/me/series", { name: readText(form, "name") });
    element.reset();
    router.refresh();
  });

  async function removeSeries(id: string) {
    await apiSend("DELETE", `/me/series/${id}`);
    router.refresh();
  }

  return (
    <div>
      {series.length > 0 && (
        <ul className='mb-6 divide-y border-b'>
          {series.map((item) => (
            <li
              key={item.id}
              className='flex items-center justify-between gap-4 py-3'>
              <div className='min-w-0'>
                <p className='truncate text-[15px]'>{item.name}</p>
                <p className='text-[12.5px] text-muted-foreground'>{pluralize(item.postCount, "post")}</p>
              </div>
              <ConfirmButton
                label='Remove'
                confirmLabel='Confirm remove'
                onConfirm={() => removeSeries(item.id)}
              />
            </li>
          ))}
        </ul>
      )}
      <form
        onSubmit={onSubmit}
        className='flex gap-2'>
        <input
          name='name'
          placeholder='New series name'
          aria-label='New series name'
          maxLength={60}
          required
          className='h-9 min-w-0 flex-1 rounded-full border bg-background px-4 text-[13px] outline-none placeholder:text-muted-foreground/70 focus:border-foreground/50'
        />
        <Button
          type='submit'
          variant='outline'
          disabled={pending}>
          Add
        </Button>
      </form>
      <div className='mt-3'>
        <FormMessage>{error}</FormMessage>
      </div>
    </div>
  );
}
