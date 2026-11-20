import hljs from "highlight.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import sanitizeHtml from "sanitize-html";

const WORDS_PER_MINUTE = 220;
const EXCERPT_LENGTH = 180;

const marked = new Marked(
  { gfm: true },
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
);

const allowedHtml: sanitizeHtml.IOptions = {
  allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "h1", "h2", "del"],
  allowedAttributes: {
    a: ["href", "title"],
    img: ["src", "alt", "title"],
    code: ["class"],
    span: ["class"],
  },
  allowedClasses: {
    code: ["hljs", /^language-[\w-]+$/],
    span: [/^hljs-[\w-]+$/, /^[\w-]+_$/],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
  },
};

export function renderMarkdown(content: string) {
  const html = sanitizeHtml(marked.parse(content, { async: false }), allowedHtml);
  const text = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").length : 0;

  return {
    html,
    excerpt: text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH).trimEnd()}...` : text,
    readingTime: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)),
  };
}
