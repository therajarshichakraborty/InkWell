import { Tabs } from "@/components/tabs";

export type DashboardView = "all" | "published" | "draft" | "saved";

const views: { view: DashboardView; label: string; href: string }[] = [
  { view: "all", label: "All", href: "/dashboard" },
  { view: "published", label: "Published", href: "/dashboard?status=published" },
  { view: "draft", label: "Drafts", href: "/dashboard?status=draft" },
  { view: "saved", label: "Saved", href: "/dashboard/bookmarks" },
];

export function DashboardTabs({ active, meta }: { active: DashboardView; meta: string }) {
  return (
    <Tabs
      meta={meta}
      tabs={views.map((item) => ({ label: item.label, href: item.href, active: item.view === active }))}
    />
  );
}
