/**
 * Re-renders every post's stored HTML from its Markdown, e.g. after changing lib/markdown.ts.
 * Only the html column is rewritten; updatedAt is preserved.
 *
 *   bun run posts:rerender            # preview which posts would change
 *   bun run posts:rerender -- --write # apply
 */
import { eq } from "drizzle-orm";
import { db, pool } from "../db/index.js";
import { post } from "../db/schema/index.js";
import { renderMarkdown } from "../lib/markdown.js";

const write = process.argv.includes("--write");

const posts = await db
  .select({ id: post.id, title: post.title, content: post.content, html: post.html, updatedAt: post.updatedAt })
  .from(post);

let changed = 0;
for (const row of posts) {
  const { html } = renderMarkdown(row.content);
  if (html === row.html) continue;

  changed++;
  console.log(`${write ? "updated" : "would update"}: ${row.title}`);
  if (write) await db.update(post).set({ html, updatedAt: row.updatedAt }).where(eq(post.id, row.id));
}

console.log(`${changed} of ${posts.length} posts ${write ? "re-rendered" : "need re-rendering"}.`);
await pool.end();
