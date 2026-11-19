type Method = "POST" | "PUT" | "PATCH" | "DELETE";

type ErrorBody = { error?: { message?: string } };

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload: ErrorBody | null = await response.json().catch(() => null);
    throw new Error(payload?.error?.message ?? "Something went wrong");
  }

  if (response.status === 204) return undefined as T;

  const payload: { data: T } = await response.json();
  return payload.data;
}

export async function apiSend<T = void>(method: Method, path: string, body?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return parse<T>(response);
}

export async function uploadImage(file: File) {
  const form = new FormData();
  form.append("image", file);

  const { url } = await parse<{ url: string }>(await fetch("/api/uploads", { method: "POST", body: form }));
  return url;
}
