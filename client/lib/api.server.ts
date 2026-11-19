import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { API_URL } from "./env";
import type { Session } from "./types";

async function request(path: string) {
  const cookie = (await headers()).get("cookie") ?? "";
  return fetch(`${API_URL}/api${path}`, { headers: { cookie }, cache: "no-store" });
}

const fetchData = cache(async (path: string): Promise<unknown> => {
  const response = await request(path);

  if (response.status === 404) notFound();
  if (response.status === 401) redirect("/login");
  if (!response.ok) throw new Error(`GET ${path} failed with ${response.status}`);

  const body: { data: unknown } = await response.json();
  return body.data;
});

export function apiGet<T>(path: string) {
  return fetchData(path) as Promise<T>;
}

export const getSession = cache(async (): Promise<Session | null> => {
  const response = await request("/auth/get-session");
  return response.ok ? response.json() : null;
});

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
