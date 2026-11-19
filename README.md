# Inkwell

A microblogging platform for writers. Authors write posts in Markdown, group them into series, tag them, and publish them to a public profile. Readers can follow writers, like, bookmark and comment on posts, search across the site, and subscribe through RSS.

<p>
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,nodejs,express,postgres,docker,bun" alt="Tech stack" />
</p>

## Tech Stack

| Layer    | Tools                                                                  |
| -------- | ---------------------------------------------------------------------- |
| Frontend | Next.js, React, TypeScript, Tailwind CSS, Motion, next-themes          |
| Backend  | Node.js, Express 5, TypeScript, Zod, Better Auth, Multer, Marked       |
| Database | PostgreSQL, Drizzle ORM                                                |
| Tooling  | Bun, Docker Compose, ESLint, Prettier, Husky, Commitlint, GitHub Actions |

## How It Works

The project is split into two apps that run side by side.

**Client (`client/`)** is a Next.js app. Pages are rendered on the server and fetch data from the API, so public posts and profiles load fast and are indexable. Requests to `/api/*` are rewritten to the backend, which keeps the browser on a single origin and lets auth cookies work without CORS.

**API (`api/`)** is an Express 5 server organised by feature. Each module (posts, users, follows, comments, engagement, series, tags, search, stats, uploads) follows the same layers:

```
routes -> controller -> service -> repository -> database
```

- **Routes** map URLs to handlers and attach auth where needed.
- **Controllers** validate input with Zod and shape the response.
- **Services** hold the business rules, such as slug generation, ownership checks and publish state.
- **Repositories** are the only layer that talks to PostgreSQL through Drizzle.

Markdown is converted to HTML with Marked and sanitised on the server before it is stored, so the client only renders safe HTML. Sessions are handled by Better Auth with email and password sign in. Images are uploaded through Multer and served from the API. Environment variables are validated at startup, so the server refuses to boot with a bad config.

## Getting Started

```bash
bun install && (cd api && bun install) && (cd client && bun install)
cp api/.env.example api/.env
cp client/.env.example client/.env

bun run db:up        # start PostgreSQL in Docker
bun run db:migrate   # apply the schema
bun run dev:api      # http://localhost:7000
bun run dev:client   # http://localhost:3000
```
