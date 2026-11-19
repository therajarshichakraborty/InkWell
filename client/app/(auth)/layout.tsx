import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/api.server";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  if (await getSession()) redirect("/dashboard");

  return children;
}
