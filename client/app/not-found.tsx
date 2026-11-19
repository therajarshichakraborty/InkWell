import { Page, PageHeader, PageIntro } from "@/components/page-layout";

export default function NotFound() {
  return (
    <Page>
      <PageHeader
        title='Not found'
        backHref='/'
      />
      <PageIntro>This page does not exist, or it has not been published yet.</PageIntro>
    </Page>
  );
}
