import type { Metadata } from "next";
import { Page, PageHeader, PageIntro, Section } from "@/components/page-layout";
import { ProfileForm } from "@/components/profile-form";
import { SeriesManager } from "@/components/series-manager";
import { apiGet, requireSession } from "@/lib/api.server";
import type { Series } from "@/lib/types";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const [session, series] = await Promise.all([requireSession(), apiGet<Series[]>("/me/series")]);

  return (
    <Page>
      <PageHeader
        title='Settings'
        backHref='/dashboard'
        action={{ label: "View blog", href: `/${session.user.username}` }}
      />
      <PageIntro>Your profile is the header of your blog. Series group related posts into tabs readers can follow.</PageIntro>
      <Section title='Profile'>
        <ProfileForm user={session.user} />
      </Section>
      <Section title='Series'>
        <SeriesManager series={series} />
      </Section>
    </Page>
  );
}
