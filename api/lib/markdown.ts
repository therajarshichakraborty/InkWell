import hljs from "highlight.js";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import sanitizeHtml from "sanitize-html";

const WORDS_PER_MINUTE = 220;
const EXCERPT_LENGTH = 180;

// Candidates for fences written without a language (the editor's code-block button inserts a bare fence).
// A short list keeps auto-detection fast and stops it from guessing obscure languages.
const AUTO_DETECT_LANGUAGES = [
  "typescript",
  "javascript",
  "xml",
  "css",
  "scss",
  "json",
  "python",
  "go",
  "rust",
  "java",
  "c",
  "cpp",
  "csharp",
  "php",
  "ruby",
  "swift",
  "bash",
  "sql",
  "yaml",
  "diff",
];

// highlight.js scores short SQL and terminal commands poorly, so catch the common cases first.
const SQL_START = /^\s*(select|insert\s+into|update|delete\s+from|create|alter|drop|with)\b/i;
const SHELL_START =
  /^\s*(\$\s|#!\/|(npm|npx|pnpm|yarn|bun|bunx|node|deno|git|docker|kubectl|curl|wget|cd|ls|mkdir|rm|cp|mv|cat|echo|export|sudo|apt|apt-get|brew|pip|pip3|python3?|go|cargo|rustup|chmod|ssh)\s)/;

function detectLanguage(code: string) {
  if (SQL_START.test(code)) return "sql";
  if (SHELL_START.test(code)) return "bash";
  return null;
}

const marked = new Marked(
  { gfm: true },
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = lang && hljs.getLanguage(lang) ? lang : detectLanguage(code);
      if (language) return hljs.highlight(code, { language }).value;
      return hljs.highlightAuto(code, AUTO_DETECT_LANGUAGES).value;
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
