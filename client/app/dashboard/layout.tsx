import type { ReactNode } from "react";
import { requireSession } from "@/lib/api.server";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireSession();

  return children;
}
