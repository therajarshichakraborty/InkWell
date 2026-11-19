"use client";

import { Page, PageHeader, PageIntro } from "@/components/page-layout";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <Page>
      <PageHeader
        title='Something went wrong'
        backHref='/'
      />
      <PageIntro>We could not load this page. Check that the API is running, then try again.</PageIntro>
      <Button
        variant='outline'
        className='mt-8'
        onClick={reset}>
        Try again
      </Button>
    </Page>
  );
}
