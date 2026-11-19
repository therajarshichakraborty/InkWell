type FeedItem = {
  title: string;
  url: string;
  description: string;
  publishedAt: Date | null;
};

type Feed = {
  title: string;
  url: string;
  description: string;
  items: FeedItem[];
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export function buildRss(feed: Feed) {
  const items = feed.items
    .map(
      (item) => `<item>
<title>${escapeXml(item.title)}</title>
<link>${escapeXml(item.url)}</link>
<guid>${escapeXml(item.url)}</guid>
<description>${escapeXml(item.description)}</description>
${item.publishedAt ? `<pubDate>${item.publishedAt.toUTCString()}</pubDate>` : ""}
</item>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>${escapeXml(feed.title)}</title>
<link>${escapeXml(feed.url)}</link>
<description>${escapeXml(feed.description)}</description>
${items}
</channel>
</rss>`;
}
