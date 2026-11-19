# First Principles of Backend Design

### How a senior engineer thinks, designs, and documents an AI-powered backend before writing code

> **The promise of this file:** if your design doc is *complete*, writing the code is just typing.
> Senior engineers spend most of their time in the document, not in the editor. Changing a sentence
> costs nothing; changing a database table after a month of code costs a week.
>
> **Stack used for code examples:** TypeScript · Node.js · Express 5 · PostgreSQL · Drizzle ORM · Zod 4 ·
> JWT · bcrypt · Anthropic SDK (Claude). The *thinking* applies to every stack. The *code* is copy-paste ready
> for this one.

---

## How to use this file

| When | Read | Time |
|------|------|------|
| **Once, slowly** | Part I (mindset) + Part II (method with a full worked example) | 2–3 hours |
| **Once per new project** | Part III + IV: copy the starter kit into the new repo | 30 minutes |
| **Every new project** | Part IX: copy the blank template into `docs/design.md` and fill it in **before** coding | 1–2 days |
| **While coding** | Part III module template: one module per entity, top to bottom | per feature |
| **When unsure** | Parts V–VIII (database, API, security, testing deep dives) | as needed |
| **To practice** | Part X: five projects, each teaching a different senior skill | weeks |
| **Before you ship** | Part XI: review checklists | 30 minutes |

**What "complete" means for a design doc.** You're done designing when all of these are true:

1. Every feature appears as a use case: "As a ___, I can ___".
2. Every table has its columns, types, nullability, constraints, foreign keys with `ON DELETE` behaviour, and indexes.
3. Every entity that changes over time has a **state machine** with allowed transitions.
4. Every business rule is **numbered** and assigned to exactly one service method.
5. Every endpoint has: method, path, auth level, request example, success response example, and every error code it can return.
6. Every slow, flaky, or expensive operation (AI, email, files) has a written async flow with states, retries, and failure handling.
7. Every non-obvious decision is in the decision log with the alternative you rejected and why.

If one of these is missing, you will discover it while coding, at 10× the cost.

---

## Table of Contents

- **Part I — How a senior engineer thinks**
  - 1. The core shift
  - 2. The twelve questions (the design pipeline)
  - 3. Fifteen mental models
  - 4. Fifty rules of thumb
  - 5. How to interrogate a requirement
- **Part II — The method, step by step (worked example: QuizForge)**
  - Steps 1–14
- **Part III — The starter kit (copy-paste foundation)**
  - Project setup, config, database, errors, HTTP helpers, middleware, app/main, auth module, module template, pagination, job queue
- **Part IV — The AI layer**
  - LLM adapter, prompt registry, structured output, streaming chat, agents with tools, usage & quotas, prompt injection, evals
- **Part V — Database design deep dive**
- **Part VI — API design deep dive**
- **Part VII — Security baseline**
- **Part VIII — Testing, logging, operations**
- **Part IX — The blank design doc template**
- **Part X — Five practice projects**
- **Part XI — Review checklists, anti-patterns, glossary**

---

# Part I — How a senior engineer thinks

## 1. The core shift

### 1.1 Juniors ask "how", seniors ask "what must be true"

A junior engineer gets a feature and asks: *"How do I build this? Which library? Which folder?"*

A senior engineer asks, in this order:

1. **What problem does this solve, and for whom?** (If you can't say it in two sentences, you don't understand it yet.)
2. **What are the things involved, and how do they relate?** (data model)
3. **What must always be true?** (rules / invariants)
4. **What can go wrong?** (failure modes)
5. **What will probably change later?** (where to leave room)
6. **Only then:** how do I build it?

The "how" is the *easy* part. You already know Express, SQL, and TypeScript. You get stuck because you jump
to step 6 while steps 1–5 are still fuzzy in your head. The fuzziness shows up as "I don't know what to put
in the service." That's not a coding problem. It's an unanswered step-3 question.

### 1.2 Design is three artifacts

Strip away the buzzwords and every backend design produces exactly three things:

| Artifact | Question it answers | Becomes in code |
|----------|--------------------|-----------------|
| **Data model** | What do we store, and how is it connected? | Tables, migrations, repositories |
| **Contract** | How does the outside world talk to us? | Routes, request validation, response DTOs, error codes |
| **Rules** | What is allowed, and what happens when? | Services |

Folders, frameworks, and patterns are packaging around these three. If the three are right, any reasonable
packaging works. If they're wrong, no packaging saves you.

### 1.3 Most backends are the same backend

After seeing many codebases you notice that ~80% of every application is the same five ingredients:

1. **Identity:** users, login, sessions, roles.
2. **Owned resources:** things a user creates, edits, lists, deletes (posts, notes, tickets, expenses).
3. **State machines:** resources that move through stages (draft → published, pending → paid → shipped).
4. **Async work:** things too slow or unreliable to do while the user waits (AI calls, emails, file processing).
5. **Derived views:** lists, counts, rankings, reports computed from the above.

When a new project arrives, a senior engineer doesn't see something new. They see "two owned resources, one
state machine, one async AI pipeline, and a leaderboard (derived view)". **Recognizing these ingredients is
the skill.** This file teaches you to see them.

---

## 2. The twelve questions (the design pipeline)

Answer these **in order**. Each answer is the input for the next one. If you get stuck on a question, the
problem is almost always an earlier answer that's still vague. Go back, don't push forward.

| # | Question | Technique | Output | Smell if you skipped it |
|---|----------|-----------|--------|-------------------------|
| 1 | What problem, for whom, and what is NOT in v1? | Write a paragraph with no technical words | Problem statement, MVP list, "later" list | Endless scope; nothing ships |
| 2 | Who uses it and what do they do? | "As a ___, I can ___" | Actors + use cases | Endpoints nobody needs; missing endpoints |
| 3 | What are the things? | Underline the **nouns** | Entity list | Tables appear and disappear while coding |
| 4 | How are the things connected? | Read each pair as a sentence | Relationships + cardinality | Wrong foreign keys; painful migrations |
| 5 | How does each thing change over time? | Draw the states and arrows | State machines | `if (status === ...)` scattered everywhere |
| 6 | What must always be true? | Numbered rule list | Invariants | Empty or bloated services; security holes |
| 7 | How is it stored? | Column-by-column tables | Schema | Wrong types, missing indexes, null bugs |
| 8 | How does the world talk to us? | Decide conventions once | API contract | Every endpoint looks different |
| 9 | What exactly can be called? | Underline the **verbs** | Endpoint catalog | Frontend blocked waiting on you |
| 10 | Where does each piece of logic live? | Map endpoint → controller → service → repo | Layer map | Business logic in controllers |
| 11 | What is slow, flaky, or expensive? | Mark every external call | Async flows | Timeouts, duplicate charges, stuck UIs |
| 12 | In what order do I build it? | Vertical slices | Build plan + decision log | Weeks of code with nothing working |

**The two tricks that unlock most of it:**

- **Nouns become tables.** "A *student* uploads *notes*; the AI creates a *quiz* with *questions*; the student makes an *attempt* and gives *answers*."
- **Verbs become endpoints and service methods.** "The student *submits* the attempt" → `POST /attempts/:id/submit` → `attemptService.submit()`.

---

## 3. Fifteen mental models

These are the lenses a senior engineer looks through without thinking about it. Learn them by name, so you
can consciously apply them until they become automatic.

### 3.1 Nouns and verbs

Every requirement is a sentence. Nouns are **data**, verbs are **behaviour**.

> "A **customer** **places** an **order** containing **products**; the **warehouse** **ships** it."

- Nouns: customer, order, product, warehouse → candidate tables. ("Warehouse" might be an actor, not a table.)
- Verbs: places, ships → endpoints/service methods (`orderService.place`, `orderService.ship`).
- Prepositions ("containing", "belongs to", "for") → relationships.

**Apply it:** write your use cases as full sentences, then literally highlight nouns and verbs.

### 3.2 Everything interesting is a state machine

Any entity with a `status` column is a state machine, whether you admit it or not. If you don't design it
explicitly, you get impossible states (an order that is both "cancelled" and "shipped") and `if` statements
scattered across ten files.

```
draft ──publish──▶ published ──archive──▶ archived
  ▲                    │
  └────unpublish───────┘
```

For each state machine, write down:
- All states.
- Allowed transitions (`from → to`), **who** can trigger each, and **what happens** as a side effect.
- What is *forbidden* (e.g., archived → published).

**Apply it:** a transition becomes exactly one service method. `publish()` checks the current state is
`draft`, changes it to `published`, and triggers side effects. Nothing else is allowed to change `status`.

### 3.3 Invariants: what must always be true

An invariant is a sentence that must hold *at all times*, no matter which endpoint was called:

- "A user can like a post at most once."
- "An order's total equals the sum of its line items."
- "Only the owner can see a draft."
- "A quiz is only playable when all its questions exist."

Invariants are the **content of your service layer**. When someone says "I don't know what goes in the
service", the answer is: *the invariants*. Each `if` in a service should trace back to one numbered rule.

**Enforce critical invariants twice:** in the service (for a good error message) and in the database (as a
constraint, the last line of defense against bugs and race conditions).

### 3.4 Ownership: every row has an owner

For every table, ask: **who owns this row, and who else may see or change it?**

| Ownership type | Example | Typical rule |
|----------------|---------|--------------|
| User-owned | notes, drafts | only the owner reads/writes |
| User-owned, publicly readable | published posts, profiles | owner writes, everyone reads |
| Shared / tenant-owned | team tickets | anyone in the org reads; role decides writes |
| System-owned | AI evaluations, jobs | only the system writes; owner reads |
| Global reference data | tags, categories, countries | everyone reads; admins write |

Most security bugs are ownership bugs ("I changed the ID in the URL and saw someone else's data"). This is
called **IDOR** (Insecure Direct Object Reference). Write the ownership column in your schema doc for every
table, and the bug becomes very hard to write.

### 3.5 Source of truth vs derived data

- **Source of truth:** data that can't be recomputed (a user's post, a payment, an answer they gave).
- **Derived data:** data computed from other data (like counts, leaderboards, totals, search indexes, AI summaries).

Rules:
1. Store sources of truth carefully: constraints, backups, never lose them.
2. Compute derived data with queries **until it's measurably slow**. Then cache or denormalize it, and write down how it gets recomputed.
3. AI outputs are a special case: they're derived, but **expensive and non-deterministic** to recompute. So store them, and treat them as a source of truth for "what the AI said at that time".

### 3.6 Read path vs write path

Most apps read far more than they write (100:1 is common). Think about the two separately:

- **Write path:** correctness matters most. Validation, transactions, invariants, idempotency.
- **Read path:** speed and shape matter most. Indexes, pagination, returning exactly what the screen needs.

A common mistake is designing the response shape around the table shape. Design responses around **what
the client screen shows**, and design tables around **what's true**. Mappers translate between the two.

### 3.7 Sync vs async: "does the user need to wait for this?"

For every action, ask whether the user must see the result before the request ends.

| Needs to wait | Doesn't need to wait |
|---------------|---------------------|
| Login | Sending a welcome email |
| Saving a draft | Generating an AI quiz (seconds to minutes) |
| Liking a post | Recomputing a leaderboard |
| Validating a form | Resizing an uploaded image |

Anything in the right column becomes a **background job**: the request records the intent (`status = pending`)
and returns `202 Accepted`. A worker does the work, and the client polls or gets notified.

**AI calls are almost always in the right column.** They take seconds, can fail, and cost money.

### 3.8 Trust boundaries

A trust boundary is any line where data comes from somewhere you don't control:

- HTTP requests (body, params, query, headers, cookies)
- Uploaded files
- Third-party API responses, **including LLM outputs**
- Webhooks
- Environment variables (validated once at startup)

**At every trust boundary: validate the shape, then validate the meaning.** Zod checks the shape ("is this a
string under 200 chars?"). The service checks the meaning ("does this user own this quiz?").

LLMs create a *second* boundary that beginners miss. Text you send *to* the model (user content) can contain
instructions that hijack it (prompt injection), and text that comes *back* is untrusted output that must be
validated before you store or display it.

### 3.9 Failure modes: "what if it fails halfway?"

For every multi-step operation, walk through each step and ask "what if the process crashes right here?"

> Register a user: (1) insert user, (2) create refresh token, (3) send welcome email.
> - Crash after 1, before 2? User exists but has no session. They can log in, so that's fine.
> - Crash after 2, before 3? No email. Acceptable if email is a retryable background job.
> - Email fails? Should registration fail? **No.** The email is a side effect, not part of the core operation.

Tools to handle partial failure:
- **Transactions:** steps that must succeed or fail together (insert order + order items).
- **Outbox / job table:** "do this later, reliably", written in the same transaction as the main change.
- **Idempotency:** retrying is safe (see 3.10).
- **Compensation:** undo step 1 if step 2 fails (refunds, cancellations).

### 3.10 Idempotency: "what if they click twice?"

Networks fail, users double-click, clients retry. An operation is **idempotent** if doing it twice has the
same effect as doing it once.

| Naturally idempotent | Not idempotent (needs design) |
|---------------------|-------------------------------|
| `PUT /posts/1/like` ("set liked = true") | `POST /posts/1/like` ("toggle") |
| `DELETE /notes/1` | `POST /payments` |
| `PATCH /me { bio }` | `POST /quizzes` (generates and costs money) |

To make a `POST` idempotent: the client sends an `Idempotency-Key` header (a UUID). The server stores the key
with the result, and a second request with the same key returns the stored result instead of doing the work again.
Use this for anything that **costs money or can't be undone** (payments, AI generation).

### 3.11 One-way doors vs two-way doors

- **Two-way door:** easy to reverse (a function name, a folder structure, a library). Decide quickly and move on.
- **One-way door:** expensive to reverse (primary key type, public URL structure, the response format clients depend on, deleting data). Slow down, think, write it in the decision log.

Beginners agonize over two-way doors ("which folder structure?") and rush through one-way doors ("I'll just
use auto-increment IDs in public URLs"). Flip that.

### 3.12 Cheap-now decisions

Some decisions cost almost nothing on day one and a lot later. Always make them up front:

- UUID primary keys (safe to expose, no enumeration attacks, merge-friendly).
- `created_at` / `updated_at` on every table, in UTC (`timestamptz`).
- API versioning prefix (`/api/v1`).
- A single response envelope and error format.
- Machine-readable error codes.
- Money as integers in the smallest unit (cents/paise), never floats.
- Config validated at startup.
- A request ID on every log line.
- Storing the prompt version and model next to every AI output.

### 3.13 Boring technology

Every new technology adds things that can break and things you have to learn. Spend that budget only where it
buys something you need *now*.

- PostgreSQL can be your database, job queue (`SKIP LOCKED`), full-text search (`tsvector`), vector store (`pgvector`), and cache (unlogged tables) until you have real scale.
- A monolith is the right architecture for one developer and zero users. Microservices are an answer to *team* scaling problems you don't have.
- Redis, Kafka, Elasticsearch, Kubernetes: add them when a measured problem demands it, and write down which problem.

### 3.14 YAGNI, but leave seams

**YAGNI** = "You Aren't Gonna Need It." Don't build features or abstractions for imagined futures.

**But leave seams:** cheap boundaries that make a future change local. Examples:
- The LLM is behind an interface (`LlmClient`), so swapping providers or adding a fake for tests touches one file.
- The job queue has an `enqueue()` function, so moving from a Postgres table to Redis later changes one module.
- Storage has a `storage.put()`, so moving from local disk to S3 changes one adapter.

The test: **a seam costs one interface and one file. An abstraction for the future costs a framework.** Build seams, skip frameworks.

### 3.15 Blast radius

When this code fails, how much breaks? Design so failures stay small:

- The AI provider is down → quiz *generation* fails gracefully. Login, browsing, and taking existing quizzes still work.
- One bad job → retried and eventually marked `failed`. It doesn't block the queue.
- A bug in one module → typed errors and a global error handler return a clean 500 for that request only.

Ask for every external dependency: **"If this is down for an hour, what does the user see?"** Write the answer in the doc.

---

## 4. Fifty rules of thumb

Short, opinionated, and right ~95% of the time. When you break one, write down why.

### Data
1. One table per *thing with its own lifecycle*. Roles ("author", "buyer") are relationships, not tables.
2. Every table: `id uuid`, `created_at`, and `updated_at` if it's mutable.
3. Every foreign key gets an index.
4. Every column used in `WHERE` or `ORDER BY` on a hot path gets an index (composite if used together).
5. `NOT NULL` by default. Make a column nullable only when "unknown/not yet" is a real state.
6. Uniqueness that matters is enforced by a `UNIQUE` constraint, not just a service check.
7. Store money as integers (minor units) plus a currency code.
8. Store time in UTC (`timestamptz`). Convert to local time only for display.
9. Enums for small, stable sets. Lookup tables for sets that admins edit.
10. `jsonb` for data you *display* but don't *query*. Real columns for data you filter/sort by.
11. Soft delete (`deleted_at`) only when something references the row or you need recovery. Otherwise hard delete.
12. Never store secrets in plaintext: passwords → bcrypt/argon2; tokens → SHA-256 hash.
13. Keep history when values change *and* someone will ask "what was it before?" (scores, prices, AI outputs).

### API
14. Plural nouns for resources: `/quizzes`, not `/getQuiz`.
15. Non-CRUD actions are `POST /resource/:id/action` (`/attempts/:id/submit`).
16. One response envelope everywhere: `{ data, meta? }` or `{ error: { code, message, details? } }`.
17. Machine-readable `code` on every error. The frontend switches on codes, never on messages.
18. Return `404`, not `403`, for resources the caller isn't allowed to know exist.
19. Cursor pagination for feeds; offset only for small admin tables.
20. Every list endpoint has a max `limit` (e.g. 100).
21. `201` + the created resource for creates; `202` + a job/status resource for async work.
22. Version the API from day one (`/api/v1`).
23. Never return raw database rows. Always map to a response DTO.
24. Validate all input at the edge with schemas. Reject unknown fields on writes.

### Code structure
25. Controllers translate HTTP ⇄ service calls. No business logic, no DB access.
26. Services hold all business rules and own transactions. No `req`, no `res`.
27. Repositories only read/write data. No `if (user.role ...)`.
28. Dependencies point downward: routes → controllers → services → repositories.
29. Services may call other services, but never in a cycle.
30. External systems (LLM, email, storage, payments) sit behind adapters with interfaces.
31. Throw typed errors from services; translate them to HTTP in one error middleware.
32. Config is read and validated in one place at startup. Nothing else reads `process.env`.
33. Prefer plain functions and objects over classes and DI containers until you feel real pain.
34. A module = one folder per feature, containing its schema, repo, service, controller, routes, and types.

### Async & reliability
35. Anything slower than ~1s, or depending on a third party, should probably be a background job.
36. Background jobs must be idempotent: assume every job may run twice.
37. Every job has `attempts`, `max_attempts`, `last_error`, and a terminal `failed` state.
38. Retries use exponential backoff. Never retry instantly in a tight loop.
39. Every external call has a timeout.
40. Write the job in the **same transaction** as the change that requires it.

### AI
41. The LLM is a slow, flaky, expensive external API. Design for it like a payment gateway.
42. Use structured outputs for anything you store or compute with. Validate with Zod anyway.
43. Store every AI output with `model`, `prompt_version`, and token usage.
44. Version prompts like code. Never edit a prompt in place without bumping the version.
45. User content sent to the model is untrusted. Delimit it and tell the model it's data.
46. Deterministic logic stays in code. Don't ask the model to do arithmetic you can do in TypeScript.
47. Every AI feature has a per-user quota and a global cost ceiling.
48. Build a fake LLM for tests and local development. Never call the real API in unit tests.
49. AI tools (for agents) are service methods with the same permission checks as endpoints.
50. Have a small "golden set" of inputs and expected qualities, and re-run it whenever the prompt or model changes.

---

## 5. How to interrogate a requirement

Requirements arrive vague: "users can upload notes and the AI makes a quiz." A senior engineer turns
one sentence into a dozen answered questions **before** designing. Here are the questions. Ask them about
every feature, and write the answers down (even if the answer is "not in v1").

### 5.1 The twelve questions for any feature

| # | Question | Example answer for "upload notes → AI quiz" |
|---|----------|---------------------------------------------|
| 1 | **Who** can do this? | Logged-in students only |
| 2 | **Who can see** the result? | Only the owner (v1). Sharing later. |
| 3 | **How big / how many?** | Notes up to 50,000 chars; max 200 notes per user |
| 4 | **How often?** | Max 20 quiz generations per user per day (cost) |
| 5 | **How long does it take?** | AI generation 10–60s → must be async |
| 6 | **What if it fails?** | Quiz marked `failed`, user sees "Try again"; no charge to their quota |
| 7 | **Can it change afterwards?** | Notes can be edited; existing quizzes keep their questions (snapshot) |
| 8 | **What if the parent is deleted?** | Deleting a note keeps its quizzes (quiz has its own copy of the source text) |
| 9 | **Can it be done twice?** | Double-click "Generate" must not create two quizzes → idempotency key |
| 10 | **What's the order/sorting?** | Quizzes listed newest first |
| 11 | **What are the limits/validation?** | 5–20 questions; difficulty easy/medium/hard |
| 12 | **What's NOT included?** | Images in notes, PDF upload, sharing, public quizzes |

Each answer becomes either a **rule** (Step 6), a **column** (Step 7), a **validation** (Step 9), or an
**async flow** (Step 11). This table is where most of the design actually happens.

### 5.2 Questions specific to AI features

| Question | Why it matters |
|----------|----------------|
| Is the output **shown**, **stored**, or **computed with**? | Shown → free text is OK. Stored/computed → structured output + validation. |
| Must the result be **consistent** across users? (rankings, grades) | Needs a fixed rubric, versioned prompts, and stored results. |
| What's the **cost per call**, and who pays? | Quotas, rate limits, caching repeat requests. |
| What does the user see while waiting? | Polling vs streaming vs notification. |
| What if the model **refuses** or returns garbage? | Retry policy, fallback, user-facing error. |
| Can the user **manipulate** the output via their input? | Prompt injection defense, especially for anything ranked or graded. |
| How will you know if a prompt change made things **worse**? | Golden-set evals. |
| Does the AI need **your data** to answer? | Context building (RAG) or tools (agent). |

---

# Part II — The method, step by step

## The running example: QuizForge

We'll design one complete application, start to finish, so you can see every step applied. It's different
from a blog on purpose, so you can see the method generalizes.

> **QuizForge:** Students paste their study notes. An AI generates a quiz (multiple-choice and short-answer
> questions) from the notes. The student takes the quiz. Multiple-choice answers are graded instantly by code;
> short answers are graded by the AI against a reference answer. After grading, the student can chat with an AI
> tutor about the questions they got wrong. A dashboard shows their progress per note.

It contains all five ingredients from §1.3: identity, owned resources (notes), state machines (quiz, attempt),
async AI work (generation, grading), derived views (progress dashboard), plus a chat.

---

## Step 1 — Problem & scope

### Technique
Write one paragraph with **no technical words** (no "API", "database", "React"). Then two lists: MVP and NOT-v1.
The NOT-v1 list matters as much as the MVP list. It's your defense against scope creep.

### Output for QuizForge

**Problem statement.** Students waste time turning their notes into practice questions. QuizForge reads a
student's notes, creates a quiz from them, grades the answers, and explains mistakes, so the student can find
and fix gaps in their understanding.

**MVP (v1):**
- Register, login, logout
- Create, edit, list, delete notes (plain text / Markdown)
- Generate a quiz from a note: choose number of questions (5–20) and difficulty
- Take a quiz: answer questions, submit
- Grading: instant for multiple-choice, AI-graded for short answers
- See results with explanations
- Tutor chat about one attempt's mistakes
- Progress dashboard: score history per note

**NOT in v1:**
- PDF or image upload (paste text only)
- Sharing quizzes or public quizzes
- Teachers, classes, or organizations
- Spaced repetition scheduling
- Payments / subscriptions (but quotas exist from day one, so costs are capped)
- Mobile push notifications

### Common mistakes
- Writing features as technologies ("use WebSockets for chat"). Write *needs*: "the tutor's reply should appear while it's being written."
- No NOT-v1 list. Every idea creeps in "because it's small."

---

## Step 2 — Actors & use cases

### Technique
List every **actor**: humans *and* non-humans (AI, background worker, cron, webhook senders). Then write every
use case as "As a ___, I can ___". Number them. Every endpoint you create later must trace back to a use case.

### Output for QuizForge

| Actor | Description |
|-------|-------------|
| Visitor | Not logged in. Can only register/login. |
| Student | Logged-in user. Owns notes, quizzes, attempts. |
| AI Generator | Creates quiz questions from note text. |
| AI Grader | Grades short answers against a reference answer. |
| AI Tutor | Chats with the student about their mistakes. |
| Worker | Background process running generation and grading jobs. |

| ID | As a… | I can… |
|----|-------|--------|
| UC1 | Visitor | **register** an *account*, **log in** |
| UC2 | Student | **log out**, **view** my *profile* |
| UC3 | Student | **create**, **edit**, **list**, **delete** my *notes* |
| UC4 | Student | **generate** a *quiz* from a *note* with a *difficulty* and *question count* |
| UC5 | Student | **see** whether my quiz is still generating, ready, or failed |
| UC6 | Student | **list** my *quizzes*, **view** a quiz's *questions* (without answers) |
| UC7 | Student | **start** an *attempt*, **save** *answers*, **submit** the attempt |
| UC8 | Student | **view** my graded attempt: *score*, correct answers, *explanations*, *feedback* |
| UC9 | Student | **chat** with the *tutor* about a graded attempt |
| UC10 | Student | **view** my *progress* per note |
| UC11 | Student | **retry** a failed quiz generation |
| UC12 | Worker | **generate** questions for pending quizzes |
| UC13 | Worker | **grade** short answers for submitted attempts |

### Common mistakes
- Forgetting non-human actors. The worker and the AI are actors; they need permissions and limits too.
- Use cases that are actually implementation ("As a user, I can call the quiz API"). Use cases describe *what the person wants*.

---

## Step 3 — Entities (find the nouns)

### Technique
Collect every noun from Step 2. For each one, decide whether it's:
- **An entity:** it has its own identity, data, and lifecycle → a table.
- **An attribute:** it describes another thing → a column (e.g., "difficulty" is a column on quiz).
- **A role:** it's a person in a relationship → a foreign key, not a table ("owner", "author").
- **Derived:** it's computed from other data → a query, not a table ("score", "progress").
- **An actor:** it acts but isn't stored → nothing (or a config).

### Output for QuizForge

| Noun | Decision | Reasoning |
|------|----------|-----------|
| account / student | **Entity: `users`** | Identity, own data |
| session | **Entity: `refresh_tokens`** | Needed to revoke logins |
| note | **Entity: `notes`** | Owned resource |
| quiz | **Entity: `quizzes`** | Has its own lifecycle (generating → ready) |
| question | **Entity: `questions`** | Many per quiz, has own data (options, answer) |
| difficulty, question count | Attribute of quiz | Describes the quiz |
| attempt | **Entity: `attempts`** | A student can take the same quiz many times |
| answer | **Entity: `attempt_answers`** | One per question per attempt; has its own grading state |
| score | Attribute of attempt (stored) | Derived, but frozen at grading time (history) |
| explanation | Attribute of question | Generated with the question |
| feedback | Attribute of answer | AI grader output per answer |
| tutor chat | **Entity: `tutor_messages`** | Ordered messages, scoped to an attempt |
| progress | **Derived** | Query over attempts grouped by note |
| AI generator / grader / tutor | Actors | Implemented as prompts + services, not tables |
| (implicit) background work | **Entity: `jobs`** | Reliable async processing |
| (implicit) AI cost | **Entity: `ai_usage`** | Quotas and cost tracking |

> 💡 **"Score" is derived but stored.** Why? Because the grading can't be recomputed identically: the AI
> grader is non-deterministic, and the prompt may change. A grade is a *historical fact*: "on that day, this
> answer got this grade." That makes it a source of truth for history. The progress *dashboard*, by contrast,
> is computed from stored scores with a query.

> 💡 **Implicit entities.** Some tables never appear as nouns in requirements: `jobs`, `ai_usage`,
> `refresh_tokens`, `idempotency_keys`. They come from non-functional needs (reliability, cost, security).
> Senior engineers add them automatically.

---

## Step 4 — Relationships & cardinality

### Technique
For every pair of entities that interact, write a sentence in **both directions**, then decide the cardinality.

| Cardinality | Sentence pattern | Implementation |
|-------------|------------------|----------------|
| 1:1 | "A user has one profile; a profile belongs to one user" | FK with `UNIQUE` on the child, or just merge the tables |
| 1:N | "A user has many notes; a note belongs to one user" | FK on the "many" side (`notes.user_id`) |
| M:N | "A post has many tags; a tag is on many posts" | Join table with composite PK (`post_tags`) |
| Self 1:N | "A comment replies to one parent comment" | FK to the same table (`parent_id`) |
| Optional | "A quiz *may* come from a note" | Nullable FK |

Then decide **`ON DELETE`** behaviour for every foreign key. This is a business decision, not a technical one:

| Option | Meaning | Use when |
|--------|---------|----------|
| `CASCADE` | Delete children with the parent | Children are meaningless without the parent (questions of a quiz) |
| `SET NULL` | Keep children, clear the link | Children have value on their own (quiz survives note deletion) |
| `RESTRICT` (default) | Block the delete | Deleting the parent should be prevented while children exist |

### Output for QuizForge

- A **user** has many **notes**; a note belongs to one user. → `notes.user_id` (CASCADE: deleting an account deletes notes)
- A **note** has many **quizzes**; a quiz *may* come from one note. → `quizzes.note_id` nullable (SET NULL: quiz survives note deletion because it stores a snapshot of the source text)
- A **user** has many **quizzes**. → `quizzes.user_id` (CASCADE)
- A **quiz** has many **questions**; a question belongs to one quiz. → `questions.quiz_id` (CASCADE)
- A **quiz** has many **attempts**; an attempt is of one quiz. → `attempts.quiz_id` (CASCADE)
- A **user** has many **attempts**. → `attempts.user_id` (CASCADE)
- An **attempt** has many **answers**; an answer belongs to one attempt and one question. → `attempt_answers.attempt_id`, `attempt_answers.question_id`, with `UNIQUE(attempt_id, question_id)`
- An **attempt** has many **tutor messages**. → `tutor_messages.attempt_id` (CASCADE)
- A **user** has many **refresh tokens**, **AI usage rows**. → CASCADE

```mermaid
erDiagram
    USERS ||--o{ NOTES : owns
    USERS ||--o{ QUIZZES : owns
    USERS ||--o{ ATTEMPTS : makes
    USERS ||--o{ REFRESH_TOKENS : has
    USERS ||--o{ AI_USAGE : incurs
    NOTES |o--o{ QUIZZES : "source of"
    QUIZZES ||--|{ QUESTIONS : contains
    QUIZZES ||--o{ ATTEMPTS : "taken as"
    ATTEMPTS ||--o{ ATTEMPT_ANSWERS : contains
    QUESTIONS ||--o{ ATTEMPT_ANSWERS : "answered by"
    ATTEMPTS ||--o{ TUTOR_MESSAGES : "discussed in"
```

### The snapshot decision
Notice that the quiz stores `source_text` (a copy of the note at generation time). Why duplicate data?
Because if the student edits the note later, the quiz's questions would no longer match the note. **When a
derived thing must stay consistent with the version of the data it was built from, snapshot that data.**
The same reasoning applies to an order storing the product price at purchase time.

---

## Step 5 — State machines

### Technique
For each entity with a status, draw states and transitions. Then write a transition table: from, to, trigger,
who, side effects. Each transition becomes one service method.

### Quiz

```
                 ┌─────────── retry (student) ─────────────┐
                 ▼                                         │
 create ──▶ generating ──(worker: success)──▶ ready        │
                 │                                         │
                 └────(worker: failed after retries)──▶ failed
```

| From | To | Trigger | Who | Side effects |
|------|----|---------|-----|--------------|
| — | generating | `POST /quizzes` | Student | Enqueue `quiz.generate` job (same transaction); reserve quota |
| generating | ready | Job succeeds | Worker | Insert questions (same transaction as the status change) |
| generating | failed | Job fails after max attempts | Worker | Store `failure_reason`; refund quota |
| failed | generating | `POST /quizzes/:id/retry` | Student | Enqueue a new job; reserve quota |

Forbidden: `ready → generating` (questions are immutable once ready; generate a new quiz instead).

### Attempt

```
 start ──▶ in_progress ──submit──▶ grading ──(all answers graded)──▶ graded
                                     │
                                     └─(grader failed)──▶ graded (failed answers scored 0, flagged)
```

| From | To | Trigger | Who | Side effects |
|------|----|---------|-----|--------------|
| — | in_progress | `POST /quizzes/:id/attempts` | Student | Create empty answers for each question |
| in_progress | in_progress | `PUT /attempts/:id/answers/:questionId` | Student | Save answer (autosave) |
| in_progress | grading | `POST /attempts/:id/submit` | Student | Grade MCQ instantly; enqueue `attempt.grade` for short answers |
| in_progress | graded | `POST /attempts/:id/submit` when no short answers exist | Student | Compute score immediately |
| grading | graded | Grade job completes | Worker | Compute final score |

> 💡 **Design tip:** if an attempt has only multiple-choice questions, skip the `grading` state entirely.
> Good state machines take the shortest path that's correct.

---

## Step 6 — Business rules (invariants)

### Technique
Number every rule. For each, decide **where it's enforced**: DB constraint, service check, or both.
Group by entity. This list *is* your service layer.

### Output for QuizForge

**Auth & users**
| # | Rule | Enforced by |
|---|------|-------------|
| R1 | Email is unique, case-insensitive (stored lowercased) | DB `UNIQUE` + service (nice error) |
| R2 | Password 8–72 chars (bcrypt ignores bytes after 72) | Zod |
| R3 | Passwords stored only as bcrypt hashes; never returned or logged | Service + DTO mapper |
| R4 | Refresh tokens rotate on every use; reuse of a revoked token revokes all the user's tokens | Service |

**Notes**
| # | Rule | Enforced by |
|---|------|-------------|
| R5 | Only the owner can read, edit, or delete a note | Service (query scoped by `user_id`) |
| R6 | Note title 1–200 chars; content 1–50,000 chars | Zod + DB `varchar`/check |
| R7 | Max 200 notes per user | Service (count before insert) |

**Quizzes**
| # | Rule | Enforced by |
|---|------|-------------|
| R8 | A quiz can be generated only from the user's own note, with content ≥ 200 chars | Service |
| R9 | `question_count` 5–20; `difficulty` ∈ easy/medium/hard | Zod + DB check |
| R10 | Max 20 generations per user per day (including retries); failed generations don't count | Service (quota) |
| R11 | Quiz status transitions only as in Step 5 | Service (one method per transition) |
| R12 | Questions are immutable once the quiz is `ready` | Service (no update endpoint exists) |
| R13 | The same `Idempotency-Key` within 24h returns the original quiz instead of creating another | Service + DB unique |
| R14 | Correct answers and explanations are never returned before the attempt is graded | DTO mapper |

**Attempts**
| # | Rule | Enforced by |
|---|------|-------------|
| R15 | Attempts can only be started on `ready` quizzes the user owns | Service |
| R16 | Max one `in_progress` attempt per quiz per user | DB partial unique index + service |
| R17 | Answers can only be saved while the attempt is `in_progress` | Service |
| R18 | Submit is allowed once; unanswered questions score 0 | Service |
| R19 | MCQ grading is done in code (deterministic); never by the AI | Service |
| R20 | Score = sum of points / max points × 100, computed in code, rounded to 1 decimal | Service |

**Tutor chat**
| # | Rule | Enforced by |
|---|------|-------------|
| R21 | Tutor chat only on the user's own `graded` attempts | Service |
| R22 | Max 30 tutor messages per user per hour; max 4,000 chars per message | Service + Zod |
| R23 | The tutor can explain but never changes grades | Architecture (tutor has no write access) |

**AI (global)**
| # | Rule | Enforced by |
|---|------|-------------|
| R24 | Note content is untrusted: delimited in prompts, model told it's data | Prompt builder |
| R25 | Every AI call is recorded in `ai_usage` with model, prompt version, tokens, cost | AI adapter wrapper |
| R26 | Every AI output that's stored is validated against a Zod schema | AI adapter |

> 🎯 **Now look at this list and the "what goes in the service?" question answers itself.**
> `quizService.create()` = R8 + R9 + R10 + R13 + enqueue. `attemptService.submit()` = R17 + R18 + R19 + R20 + enqueue.

---

## Step 7 — Schema

### Technique
For every entity: every column with type, nullability, default, constraints. Every FK with `ON DELETE`. Every
index with the query it serves. Write the **owner** of each table.

Conventions (decide once):
- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz not null default now()`, `updated_at timestamptz not null default now()` (mutable tables)
- snake_case tables and columns; the ORM maps them to camelCase in TypeScript
- enums for status fields

### `users` (owner: self)
| Column | Type | Null | Default | Constraints |
|--------|------|------|---------|-------------|
| id | uuid | no | random | PK |
| email | varchar(255) | no | | UNIQUE (stored lowercase) |
| password_hash | text | no | | |
| display_name | varchar(80) | no | | |
| role | enum user/admin | no | `user` | |
| created_at, updated_at | timestamptz | no | now() | |

### `refresh_tokens` (owner: user)
| Column | Type | Null | Constraints |
|--------|------|------|-------------|
| id | uuid | no | PK |
| user_id | uuid | no | FK users CASCADE, index |
| token_hash | char(64) | no | UNIQUE |
| expires_at | timestamptz | no | |
| revoked_at | timestamptz | yes | |
| replaced_by_id | uuid | yes | (rotation chain) |
| created_at | timestamptz | no | |

### `notes` (owner: user, private)
| Column | Type | Null | Constraints |
|--------|------|------|-------------|
| id | uuid | no | PK |
| user_id | uuid | no | FK users CASCADE |
| title | varchar(200) | no | |
| content | text | no | check length ≤ 50000 |
| created_at, updated_at | timestamptz | no | |

Index: `(user_id, updated_at desc, id)` → "list my notes, recently edited first".

### `quizzes` (owner: user, private)
| Column | Type | Null | Constraints / notes |
|--------|------|------|---------------------|
| id | uuid | no | PK |
| user_id | uuid | no | FK users CASCADE |
| note_id | uuid | yes | FK notes SET NULL |
| title | varchar(200) | no | copied from note title |
| source_text | text | no | snapshot of note content |
| difficulty | enum easy/medium/hard | no | |
| question_count | smallint | no | check 5–20 |
| status | enum generating/ready/failed | no | default `generating` |
| failure_reason | text | yes | |
| idempotency_key | varchar(100) | yes | UNIQUE (user_id, idempotency_key) |
| model, prompt_version | varchar | yes | set when ready |
| created_at, updated_at | timestamptz | no | |

Indexes: `(user_id, created_at desc, id)`, `(note_id)`.

### `questions` (owner: system, readable by quiz owner)
| Column | Type | Null | Notes |
|--------|------|------|-------|
| id | uuid | no | PK |
| quiz_id | uuid | no | FK quizzes CASCADE, index |
| position | smallint | no | 1..N, UNIQUE(quiz_id, position) |
| type | enum mcq/short | no | |
| prompt | text | no | the question |
| options | jsonb | yes | `string[]` for MCQ, null for short |
| correct_option | smallint | yes | index into options (MCQ) |
| reference_answer | text | yes | for short answers |
| explanation | text | no | |
| points | smallint | no | default 1 |

### `attempts` (owner: user)
| Column | Type | Null | Notes |
|--------|------|------|-------|
| id | uuid | no | PK |
| quiz_id | uuid | no | FK quizzes CASCADE |
| user_id | uuid | no | FK users CASCADE |
| status | enum in_progress/grading/graded | no | default in_progress |
| score | numeric(5,1) | yes | 0–100, set when graded |
| started_at | timestamptz | no | |
| submitted_at, graded_at | timestamptz | yes | |

Indexes: `(user_id, started_at desc)`, and **partial unique** `(quiz_id, user_id) WHERE status = 'in_progress'` → rule R16 enforced by the database.

### `attempt_answers`
| Column | Type | Null | Notes |
|--------|------|------|-------|
| id | uuid | no | PK |
| attempt_id | uuid | no | FK attempts CASCADE |
| question_id | uuid | no | FK questions CASCADE |
| selected_option | smallint | yes | MCQ |
| text_answer | text | yes | short, max 2000 |
| grading_status | enum pending/graded/failed | no | default pending |
| points_awarded | numeric(4,2) | yes | |
| feedback | text | yes | AI grader feedback |
| updated_at | timestamptz | no | |

Constraint: `UNIQUE(attempt_id, question_id)`.

### `tutor_messages`
| Column | Type | Null | Notes |
|--------|------|------|-------|
| id | uuid | no | PK |
| attempt_id | uuid | no | FK attempts CASCADE |
| role | enum user/assistant | no | |
| content | text | no | |
| created_at | timestamptz | no | index (attempt_id, created_at) |

### `jobs` (owner: system)
| Column | Type | Null | Notes |
|--------|------|------|-------|
| id | uuid | no | PK |
| type | varchar(50) | no | e.g. `quiz.generate` |
| payload | jsonb | no | validated per type |
| status | enum pending/running/completed/failed | no | |
| attempts / max_attempts | smallint | no | 0 / 3 |
| run_at | timestamptz | no | for backoff scheduling |
| locked_at | timestamptz | yes | to detect stuck jobs |
| last_error | text | yes | |
| created_at, completed_at | timestamptz | | |

Index: `(status, run_at)`. This is what the worker polls.

### `ai_usage` (owner: system, about a user)
| Column | Type | Null | Notes |
|--------|------|------|-------|
| id | uuid | no | PK |
| user_id | uuid | yes | FK users SET NULL (keep cost history) |
| feature | varchar(50) | no | `quiz.generate`, `answer.grade`, `tutor.chat` |
| model | varchar(80) | no | |
| prompt_version | varchar(40) | no | |
| input_tokens, output_tokens | integer | no | |
| cost_micros | bigint | no | cost in millionths of a USD |
| success | boolean | no | |
| created_at | timestamptz | no | index (user_id, feature, created_at) |

---

## Step 8 — API contract (conventions)

Decide these once and write them at the top of the endpoint catalog. Copy this section as-is into every project.

**Base URL:** `/api/v1`

**Auth:** `Authorization: Bearer <accessToken>` (JWT, 15 min). Refresh token in an `httpOnly` cookie
(`refresh_token`, 7 days, path `/api/v1/auth`).

**Success envelope**
```json
{ "data": { } }
{ "data": [ ], "meta": { "nextCursor": "opaque-string-or-null" } }
```

**Error envelope**
```json
{ "error": { "code": "QUIZ_NOT_FOUND", "message": "Quiz not found.", "details": { } } }
```

**Status codes:** 200 OK · 201 Created · 202 Accepted (async started) · 204 No Content · 400 validation ·
401 not authenticated · 403 authenticated but forbidden · 404 not found / not yours · 409 conflict / wrong
state · 422 business rule violated · 429 rate limit or quota · 500 bug · 503 dependency down.

**Pagination:** `?limit=20&cursor=<opaque>`. Max limit 100. Response `meta.nextCursor` is `null` on the last page.

**Dates:** ISO 8601 UTC strings (`2026-11-13T10:00:00.000Z`).

**IDs:** UUID strings.

**Naming:** JSON fields camelCase. Query params camelCase.

**Idempotency:** `POST` endpoints that cost money accept an `Idempotency-Key` header.

**Legend used below:** 🌐 public · 🔐 logged in · 👤 owner only (others get 404)

---

## Step 9 — Endpoint catalog

### Technique
Underline the verbs from Step 2. Each verb on a noun becomes an endpoint. For **every** endpoint write:
method, path, auth level, the use case it serves, a request example, a success response example, and the
list of error codes. If you can't write the response example, you haven't decided what the screen shows.

### Overview

| # | Method | Path | Auth | UC | Purpose |
|---|--------|------|------|----|---------|
| E1 | POST | `/auth/register` | 🌐 | UC1 | Create account |
| E2 | POST | `/auth/login` | 🌐 | UC1 | Log in |
| E3 | POST | `/auth/refresh` | 🌐 cookie | UC1 | New access token |
| E4 | POST | `/auth/logout` | 🌐 cookie | UC2 | Revoke refresh token |
| E5 | GET | `/auth/me` | 🔐 | UC2 | Current user |
| E6 | GET | `/notes` | 🔐 | UC3 | List my notes |
| E7 | POST | `/notes` | 🔐 | UC3 | Create note |
| E8 | GET | `/notes/:id` | 👤 | UC3 | Get note |
| E9 | PATCH | `/notes/:id` | 👤 | UC3 | Edit note |
| E10 | DELETE | `/notes/:id` | 👤 | UC3 | Delete note |
| E11 | POST | `/quizzes` | 🔐 | UC4 | Generate quiz (async, 202) |
| E12 | GET | `/quizzes` | 🔐 | UC6 | List my quizzes |
| E13 | GET | `/quizzes/:id` | 👤 | UC5, UC6 | Quiz status + questions (no answers) |
| E14 | POST | `/quizzes/:id/retry` | 👤 | UC11 | Retry failed generation |
| E15 | DELETE | `/quizzes/:id` | 👤 | — | Delete quiz |
| E16 | POST | `/quizzes/:id/attempts` | 👤 | UC7 | Start attempt |
| E17 | GET | `/attempts/:id` | 👤 | UC7, UC8 | Attempt with answers (results if graded) |
| E18 | PUT | `/attempts/:id/answers/:questionId` | 👤 | UC7 | Save one answer (idempotent) |
| E19 | POST | `/attempts/:id/submit` | 👤 | UC7 | Submit for grading |
| E20 | GET | `/attempts/:id/tutor/messages` | 👤 | UC9 | Tutor chat history |
| E21 | POST | `/attempts/:id/tutor/messages` | 👤 | UC9 | Send message, streamed reply (SSE) |
| E22 | GET | `/progress` | 🔐 | UC10 | Progress per note |
| E23 | GET | `/me/usage` | 🔐 | R10 | Remaining AI quota today |
| E24 | GET | `/health` | 🌐 | — | Liveness + DB check |

### Auth

**E1 `POST /auth/register`**
```http
POST /api/v1/auth/register
Content-Type: application/json

{ "email": "Riya@Example.com", "password": "correct-horse-9", "displayName": "Riya" }
```
```http
201 Created
Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth; Max-Age=604800

{ "data": {
    "user": { "id": "4f6c…", "email": "riya@example.com", "displayName": "Riya", "role": "user", "createdAt": "2026-11-13T10:00:00.000Z" },
    "accessToken": "eyJhbGciOi…"
} }
```
Errors: `400 VALIDATION_ERROR` · `409 EMAIL_TAKEN`

**E2 `POST /auth/login`**
```json
{ "email": "riya@example.com", "password": "correct-horse-9" }
```
`200` → same shape as register. Errors: `400 VALIDATION_ERROR` · `401 INVALID_CREDENTIALS` (the same error for an unknown email and a wrong password) · `429 RATE_LIMITED`

**E3 `POST /auth/refresh`** (no body; reads the cookie) → `200 { "data": { "accessToken": "…" } }` + a new cookie.
Errors: `401 INVALID_REFRESH_TOKEN`

**E4 `POST /auth/logout`** → `204`, cookie cleared. Always succeeds (idempotent).

**E5 `GET /auth/me`** → `200 { "data": { "id": "…", "email": "…", "displayName": "Riya", "role": "user", "createdAt": "…" } }`
Errors: `401 UNAUTHENTICATED`

### Notes

**E6 `GET /notes?limit=20&cursor=…`**
```json
{ "data": [
    { "id": "n_1", "title": "Photosynthesis", "preview": "Photosynthesis converts light energy into…", "updatedAt": "…", "createdAt": "…" }
  ],
  "meta": { "nextCursor": "eyJ0IjoiMjAyNi0xMS0xM1QxMDowMDowMC4wMDBaIiwiaSI6Im5fMSJ9" } }
```
List items return a `preview` (first 160 chars), not the full content. **List responses are smaller than detail responses.**

**E7 `POST /notes`**
```json
{ "title": "Photosynthesis", "content": "Photosynthesis converts light energy into chemical energy…" }
```
`201 { "data": { "id": "n_1", "title": "…", "content": "…", "createdAt": "…", "updatedAt": "…" } }`
Errors: `400 VALIDATION_ERROR` · `422 NOTE_LIMIT_REACHED`

**E8 `GET /notes/:id`** → `200` full note. Errors: `404 NOTE_NOT_FOUND` (also when it belongs to someone else)

**E9 `PATCH /notes/:id`** body `{ "title"?: string, "content"?: string }` (at least one) → `200` full note. Errors: `400`, `404`

**E10 `DELETE /notes/:id`** → `204`. Errors: `404`. Quizzes made from this note keep existing (`note_id` becomes null).

### Quizzes

**E11 `POST /quizzes`**
```http
POST /api/v1/quizzes
Idempotency-Key: 6b1f3c2e-8a1d-4c55-9f0e-2a7b4d1e9c01

{ "noteId": "n_1", "difficulty": "medium", "questionCount": 10 }
```
```http
202 Accepted
Location: /api/v1/quizzes/q_7

{ "data": { "id": "q_7", "status": "generating", "title": "Photosynthesis", "difficulty": "medium",
            "questionCount": 10, "createdAt": "…" } }
```
Repeat with the same `Idempotency-Key` → `202` with the **same** quiz `q_7`; no second job, no second charge.
Errors: `400 VALIDATION_ERROR` · `404 NOTE_NOT_FOUND` · `422 NOTE_TOO_SHORT` · `429 AI_QUOTA_EXCEEDED` (`details: { limit: 20, resetsAt: "…" }`)

**E12 `GET /quizzes?status=ready&limit=20&cursor=…`**
```json
{ "data": [ { "id": "q_7", "title": "Photosynthesis", "status": "ready", "difficulty": "medium",
              "questionCount": 10, "bestScore": 80.0, "attemptCount": 2, "createdAt": "…" } ],
  "meta": { "nextCursor": null } }
```

**E13 `GET /quizzes/:id`**. The frontend polls this every 2–3 seconds while `status = generating`.
```json
{ "data": {
    "id": "q_7", "title": "Photosynthesis", "status": "ready", "difficulty": "medium", "questionCount": 10,
    "failureReason": null,
    "questions": [
      { "id": "qs_1", "position": 1, "type": "mcq", "prompt": "Where does the light reaction occur?",
        "options": ["Stroma", "Thylakoid membrane", "Cytoplasm", "Nucleus"], "points": 1 },
      { "id": "qs_2", "position": 2, "type": "short", "prompt": "Explain the role of chlorophyll.", "options": null, "points": 2 }
    ]
} }
```
There is **no** `correctOption`, `referenceAnswer`, or `explanation` here (rule R14). `questions` is `[]` while generating.
Errors: `404 QUIZ_NOT_FOUND`

**E14 `POST /quizzes/:id/retry`** → `202` with `status: "generating"`. Errors: `404` · `409 QUIZ_NOT_FAILED` · `429 AI_QUOTA_EXCEEDED`

**E15 `DELETE /quizzes/:id`** → `204`. Errors: `404` · `409 QUIZ_GENERATING` (can't delete while a job is running)

### Attempts

**E16 `POST /quizzes/:id/attempts`**
```json
{ "data": { "id": "a_3", "quizId": "q_7", "status": "in_progress", "startedAt": "…",
            "answers": [ { "questionId": "qs_1", "selectedOption": null, "textAnswer": null } ] } }
```
`201`. Errors: `404 QUIZ_NOT_FOUND` · `409 QUIZ_NOT_READY` · `409 ATTEMPT_ALREADY_IN_PROGRESS` (`details: { attemptId }`, so the client can resume)

**E18 `PUT /attempts/:id/answers/:questionId`**
```jsonc
{ "selectedOption": 1 }                           // MCQ
{ "textAnswer": "Chlorophyll absorbs light…" }    // short answer
```
`200 { "data": { "questionId": "qs_1", "selectedOption": 1, "textAnswer": null } }`
`PUT` because it *sets* the answer. Sending it twice is harmless, which makes autosave safe.
Errors: `400` · `404 ATTEMPT_NOT_FOUND` / `QUESTION_NOT_FOUND` · `409 ATTEMPT_NOT_IN_PROGRESS` · `422 ANSWER_TYPE_MISMATCH`

**E19 `POST /attempts/:id/submit`**
```jsonc
{ "data": { "id": "a_3", "status": "grading", "submittedAt": "…" } }   // has short answers → AI grading runs async
{ "data": { "id": "a_3", "status": "graded", "score": 70.0 } }         // MCQ only → graded instantly
```
`200`. Errors: `404` · `409 ATTEMPT_NOT_IN_PROGRESS`

**E17 `GET /attempts/:id`** (after grading)
```json
{ "data": {
    "id": "a_3", "quizId": "q_7", "status": "graded", "score": 75.0,
    "startedAt": "…", "submittedAt": "…", "gradedAt": "…",
    "results": [
      { "questionId": "qs_1", "position": 1, "type": "mcq", "prompt": "Where does the light reaction occur?",
        "options": ["Stroma", "Thylakoid membrane", "Cytoplasm", "Nucleus"],
        "selectedOption": 0, "correctOption": 1, "pointsAwarded": 0, "points": 1,
        "explanation": "Light reactions happen in the thylakoid membranes…" },
      { "questionId": "qs_2", "position": 2, "type": "short", "prompt": "Explain the role of chlorophyll.",
        "textAnswer": "It absorbs light", "referenceAnswer": "Chlorophyll absorbs mainly red and blue light…",
        "pointsAwarded": 1.5, "points": 2, "gradingStatus": "graded",
        "feedback": "Correct core idea; mention which wavelengths and what the energy is used for.",
        "explanation": "…" }
    ]
} }
```
While `in_progress`, the shape is the same, but `results` has no correct answers, explanations, or feedback (R14).

### Tutor chat

**E20 `GET /attempts/:id/tutor/messages`** → `200 { "data": [ { "id": "m_1", "role": "user", "content": "…", "createdAt": "…" } ] }`

**E21 `POST /attempts/:id/tutor/messages`**
```http
POST /api/v1/attempts/a_3/tutor/messages
Accept: text/event-stream

{ "content": "Why is the answer to question 1 the thylakoid and not the stroma?" }
```
```
HTTP/1.1 200 OK
Content-Type: text/event-stream

event: start
data: {"userMessageId":"m_9"}

event: delta
data: {"text":"Great question! The stroma is where "}

event: delta
data: {"text":"the Calvin cycle happens…"}

event: done
data: {"assistantMessageId":"m_10"}
```
Errors **before** the stream starts are normal JSON: `404` · `409 ATTEMPT_NOT_GRADED` · `429 TUTOR_RATE_LIMITED`.
Errors **after** the stream starts arrive as `event: error` with `{ "code": "AI_UNAVAILABLE" }`, because the headers were already sent.

### Progress & usage

**E22 `GET /progress`**
```json
{ "data": [
  { "noteId": "n_1", "noteTitle": "Photosynthesis", "attempts": 4, "bestScore": 90.0,
    "averageScore": 76.3, "lastAttemptAt": "…" }
] }
```

**E23 `GET /me/usage`** → `{ "data": { "quizGenerations": { "used": 3, "limit": 20, "resetsAt": "…" }, "tutorMessages": { "used": 4, "limit": 30, "windowMinutes": 60 } } }`

**E24 `GET /health`** → `200 { "data": { "status": "ok", "db": "ok" } }`, or `503` with `"db": "down"`.

---

## Step 10 — Layer map

### Technique
For every endpoint, write down the controller function, the service method, and the repository calls.
If a service method name doesn't match a verb from your use cases, you've probably invented something nobody asked for.

| Endpoint | Controller | Service method | Rules | Repositories / adapters |
|----------|-----------|----------------|-------|-------------------------|
| E1 | `authController.register` | `authService.register` | R1–R3 | usersRepo, tokensRepo, password, tokens |
| E2 | `authController.login` | `authService.login` | R3 | usersRepo, tokensRepo |
| E3 | `authController.refresh` | `authService.refresh` | R4 | tokensRepo |
| E7 | `notesController.create` | `notesService.create` | R6, R7 | notesRepo |
| E8–E10 | `notesController.*` | `notesService.getOwned/update/remove` | R5 | notesRepo |
| E11 | `quizzesController.create` | `quizzesService.create` | R8–R10, R13 | notesRepo, quizzesRepo, quota, jobs.enqueue |
| E13 | `quizzesController.get` | `quizzesService.getOwnedWithQuestions` | R14 | quizzesRepo, questionsRepo |
| E14 | `quizzesController.retry` | `quizzesService.retry` | R10, R11 | quizzesRepo, quota, jobs.enqueue |
| (job) | — | `quizzesService.generate` (worker) | R11, R24–R26 | quizzesRepo, questionsRepo, llm, aiUsage |
| E16 | `attemptsController.start` | `attemptsService.start` | R15, R16 | quizzesRepo, attemptsRepo |
| E18 | `attemptsController.saveAnswer` | `attemptsService.saveAnswer` | R17 | attemptsRepo, answersRepo |
| E19 | `attemptsController.submit` | `attemptsService.submit` | R17–R20 | attemptsRepo, answersRepo, jobs.enqueue |
| (job) | — | `attemptsService.gradeShortAnswers` | R20, R24–R26 | answersRepo, llm, aiUsage |
| E21 | `tutorController.send` | `tutorService.streamReply` | R21–R24 | attemptsRepo, tutorRepo, llm, rate limit |
| E22 | `progressController.get` | `progressService.forUser` | — | progressRepo (one aggregate query) |

### What each layer is allowed to do

```
 Request
   │
 ROUTES ........... URL + method → middleware chain → controller. No logic.
   │
 MIDDLEWARE ....... Cross-cutting: request id, logging, auth (who are you?), rate limit, error handling.
   │
 CONTROLLER ....... Parse input with Zod → call ONE service method → map result to DTO → send status + JSON.
   │                Never: SQL, business rules, try/catch for flow control.
 SERVICE .......... Business rules, permissions ("is this yours?"), state transitions, transactions,
   │                orchestration of repos and adapters. Never: req, res, status codes, headers.
 REPOSITORY ....... Queries. Input: plain values. Output: rows. Never: rules, permissions, HTTP.
   │
 DATABASE

 ADAPTERS (side) .. LLM, email, storage, payment. Called only by services, through an interface.
```

**The three litmus tests**
1. *Can I call this service from a script or a job with no HTTP?* If not, HTTP has leaked into it.
2. *Does this repository function contain an `if` about users, roles, or what a status means?* If yes, a rule has leaked into it.
3. *Is this controller function longer than ~10 lines?* If yes, logic has leaked into it.

---

## Step 11 — Async & AI flows

### Technique
For every slow, flaky, or expensive operation, write down: trigger, states, steps, what's inside the
transaction, retry policy, failure behaviour, and what the user sees at each moment.

### Flow A: Quiz generation (structured output, background job)

```
Student ─ POST /quizzes ─▶ quizzesService.create
   1. Validate note ownership & length (R8)
   2. Check idempotency key → if seen, return the existing quiz (R13)
   3. Check quota (R10)
   4. TRANSACTION:
        INSERT quizzes (status=generating, source_text=snapshot)
        INSERT jobs (type='quiz.generate', payload={quizId})
   5. Return 202 + quiz ──────────────▶ client polls GET /quizzes/:id

Worker (every ~1s) ─ claims a job with FOR UPDATE SKIP LOCKED
   6. Load quiz; if status ≠ generating → job is stale, finish without doing anything (idempotency)
   7. Build prompt: system (rules + format) + user (<notes>…</notes>, difficulty, count)
   8. llm.runStructured(quizGenerationPrompt) → Zod-validated object
   9. Post-validate in code: exactly N questions; each MCQ has 4 options; correct index in range
  10. TRANSACTION:
        INSERT questions (all N)
        UPDATE quizzes SET status=ready, model, prompt_version
  11. Record ai_usage (success=true)

  On error in steps 7–10:
        attempts < max → job goes back to pending with backoff (10s, 40s, 160s)
        attempts = max → TRANSACTION: quiz.status=failed, failure_reason; job failed; ai_usage(success=false)
```

**What the user sees:** a "Generating your quiz…" spinner (polling), then either the questions or "Generation failed. Retry?"

**Why each piece exists:**
- The job row is in the **same transaction** as the quiz, so a quiz can never be stuck in `generating` with no job.
- The stale check in step 6 means that if a job runs twice (a crash after step 10, before the job is marked complete), the second run does nothing.
- The code check in step 9 is needed because the model may return 9 questions when you asked for 10. Schemas check shape; code checks meaning.
- Failed generations don't consume quota, so users aren't punished for the provider's outage.

### Flow B: Short-answer grading (structured output, background job)

```
POST /attempts/:id/submit ─▶ attemptsService.submit
   1. Check status = in_progress (R17)
   2. TRANSACTION:
        Grade every MCQ answer in code (R19): points = selected === correct ? points : 0
        Mark unanswered questions as graded with 0 points (R18)
        If no ungraded short answers remain → compute score (R20), status = graded
        Else → status = grading, INSERT jobs (type='attempt.grade', payload={attemptId})
   3. Return 200 + attempt

Worker: attempt.grade
   4. Load pending short answers + their questions
   5. For each answer: llm.runStructured(gradeAnswerPrompt, { question, referenceAnswer, studentAnswer, maxPoints })
        → { pointsAwarded, feedback }; clamp pointsAwarded to [0, maxPoints] in code
   6. Save each answer as soon as it's graded (a retry only re-grades the remaining ones → idempotent and cheaper)
   7. When none are pending: compute the score in code, attempt.status = graded
   On final failure for one answer: grading_status=failed, 0 points, feedback "Could not grade automatically"
```

### Flow C: Tutor chat (streaming, synchronous)

This flow is **synchronous**, because the user is actively waiting and watching. Streaming makes the wait feel short.

```
POST /attempts/:id/tutor/messages
   1. Load attempt; check owner and status = graded (R21)
   2. Rate limit (R22)
   3. INSERT user message
   4. Build context on the server (never from the client):
        system: tutor persona + rules ("explain, never change grades", "only discuss this quiz")
        context: the questions, student's answers, correct answers, feedback (delimited as data)
        history: last 20 messages
   5. Open SSE; stream deltas from llm.streamChat to the client
   6. On finish: INSERT assistant message; record ai_usage
   7. On client disconnect: abort the LLM call; save the partial reply
```

### Flow D: Progress (derived view, plain query)

```sql
SELECT q.note_id, max(q.title) AS note_title, count(a.id) AS attempts,
       max(a.score) AS best_score, round(avg(a.score), 1) AS average_score, max(a.graded_at) AS last_attempt_at
FROM attempts a
JOIN quizzes q ON q.id = a.quiz_id
WHERE a.user_id = $1 AND a.status = 'graded'
GROUP BY q.note_id
ORDER BY last_attempt_at DESC;
```
No table and no cache. Turn it into a materialized view only if it gets slow, which it won't at thousands of rows.

---

## Step 12 — Error catalog

One list, shared with the frontend. Each code has a fixed HTTP status.

| Code | HTTP | When |
|------|------|------|
| `VALIDATION_ERROR` | 400 | Zod failed (details = field errors) |
| `INVALID_JSON` | 400 | Body isn't valid JSON |
| `UNAUTHENTICATED` | 401 | Missing/invalid/expired access token |
| `INVALID_CREDENTIALS` | 401 | Login failed |
| `INVALID_REFRESH_TOKEN` | 401 | Refresh cookie missing/expired/revoked |
| `FORBIDDEN` | 403 | Authenticated, but the role isn't allowed (admin routes) |
| `NOT_FOUND` | 404 | Unknown route |
| `NOTE_NOT_FOUND`, `QUIZ_NOT_FOUND`, `ATTEMPT_NOT_FOUND`, `QUESTION_NOT_FOUND` | 404 | Doesn't exist, or isn't yours |
| `EMAIL_TAKEN` | 409 | Register with an existing email |
| `CONFLICT` | 409 | Generic unique violation caught by the DB |
| `QUIZ_NOT_READY`, `QUIZ_NOT_FAILED`, `QUIZ_GENERATING` | 409 | Wrong quiz state |
| `ATTEMPT_ALREADY_IN_PROGRESS`, `ATTEMPT_NOT_IN_PROGRESS`, `ATTEMPT_NOT_GRADED` | 409 | Wrong attempt state |
| `NOTE_LIMIT_REACHED`, `NOTE_TOO_SHORT`, `ANSWER_TYPE_MISMATCH` | 422 | Business rule violated |
| `RATE_LIMITED`, `TUTOR_RATE_LIMITED` | 429 | Too many requests |
| `AI_QUOTA_EXCEEDED` | 429 | Daily AI quota used up |
| `AI_UNAVAILABLE` | 503 | LLM provider failing |
| `INTERNAL_ERROR` | 500 | Our bug |

**409 vs 422, a rule you can apply every time:** 409 means "the resource is in the wrong *state* for this right now"
(it may work later). 422 means "this request *itself* breaks a rule" (it will never work as sent).

---

## Step 13 — Non-functional baseline

Nobody asks for these, but every production backend has them. Write the numbers down.

| Concern | Decision for QuizForge |
|---------|------------------------|
| Request body limit | 100 KB JSON (notes are ≤ 50,000 chars) |
| Global rate limit | 300 requests / 5 min per IP |
| Login rate limit | 10 attempts / 15 min per IP |
| AI quotas | 20 generations/day, 30 tutor messages/hour per user |
| Global AI cost ceiling | Pause non-essential AI features if today's `ai_usage` cost passes a configured limit |
| Timeouts | LLM 120 s; DB statement 10 s |
| Logging | JSON lines with request id, user id, route, status, duration. Never log passwords, tokens, or note content |
| Secrets | Only from env vars, validated at startup |
| CORS | Only the frontend origin(s); `credentials: true` for the refresh cookie |
| Health | `/health` checks DB connectivity |
| Shutdown | On SIGTERM: stop accepting requests, let the worker finish its current job, close the DB pool |
| Backups | Managed Postgres daily backups (hosting provider) |

---

## Step 14 — Build plan & decision log

### Vertical slices
Build one feature **top to bottom** (schema → repo → service → controller → route → test), see it work, then commit.
Never build "all the schemas" first, then "all the repositories".

| Slice | Contents | Done when |
|-------|----------|-----------|
| 0 | Starter kit: config, db, errors, middleware, health, job worker skeleton | `/health` returns ok; unknown routes return a JSON 404 |
| 1 | Auth | register → login → me → refresh → logout all work with curl |
| 2 | Notes | CRUD + pagination; another user's note returns 404 |
| 3 | Quiz generation with **FakeLlm** | POST quiz → poll → ready with fake questions |
| 4 | Real LLM adapter + usage + quota | real questions; quota blocks the 21st request |
| 5 | Attempts + MCQ grading | take a quiz, submit, see the score |
| 6 | Short-answer AI grading | grading → graded flow works; retries work |
| 7 | Tutor chat streaming | deltas stream; history persists; disconnect aborts |
| 8 | Progress | numbers match a manual calculation |
| 9 | Hardening | rate limits; tests for every rule R1–R26 |

> 💡 Slice 3 uses a **fake** LLM on purpose. You build and test the whole pipeline (job, polling, states)
> without spending money or depending on the network. Switching to the real model in slice 4 is one config change.

### Decision log

| # | Decision | Rejected alternative | Why |
|---|----------|---------------------|-----|
| D1 | Quiz snapshots `source_text` | Read the note live | Note edits must not desync existing questions |
| D2 | Postgres `jobs` table + `SKIP LOCKED` | Redis/BullMQ | No extra infrastructure at zero users; jobs enqueue inside the same transaction |
| D3 | MCQ graded in code | AI grades everything | Deterministic, free, instant |
| D4 | Polling for generation status | WebSockets | Simple; 2–3 s of latency is fine for a 30 s task |
| D5 | SSE for tutor chat | WebSockets | A one-way stream is enough; plain HTTP |
| D6 | Progress as a query | Stored progress table | Derived data; fast enough |
| D7 | Feature-folder modules | Layer folders | Copy one module folder to start a new entity |
| D8 | Failed generations don't count toward quota | Count all attempts | Fair when the provider fails |
| D9 | Store `prompt_version` + `model` on outputs | Don't track | Debug quality regressions after prompt changes |

---

# Part III — The starter kit (copy-paste foundation)

Everything in Part II was *thinking*. This part is the *typing*: a foundation you copy into every new project
**once**, so that each project starts with config, database, errors, auth, pagination, and a job queue already done.
After that, every new feature is a copy of the module template (§III.9) with the names changed.

> Every file below is complete. Paths are relative to the project root. Imports use the `.js` extension
> because the project is native ESM (`"type": "module"`). TypeScript resolves `./x.js` to `./x.ts`.

## III.1 Folder structure

```
project/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── .env.example
├── drizzle/                      # generated migrations (commit these)
└── src/
    ├── main.ts                   # process entry: server + worker + graceful shutdown
    ├── app.ts                    # builds the Express app (middleware order lives here)
    ├── routes.ts                 # mounts every module router under /api/v1
    ├── config/
    │   └── env.ts                # the ONLY place that reads process.env
    ├── db/
    │   ├── client.ts             # pool, drizzle instance, Executor type, one()/maybeOne()
    │   └── columns.ts            # shared column helpers (id, timestamps)
    ├── core/
    │   ├── errors.ts             # AppError + factories
    │   ├── http.ts               # ok/created/accepted/noContent helpers
    │   ├── logger.ts             # JSON logger
    │   ├── pagination.ts         # cursor encode/decode, PageQuery, toPage
    │   ├── crypto.ts             # sha256, randomToken
    │   └── schemas.ts            # shared Zod schemas (IdParams…)
    ├── middleware/
    │   ├── request-id.ts
    │   ├── request-logger.ts
    │   ├── auth.ts               # requireAuth, requireRole, currentUser
    │   ├── rate-limit.ts
    │   ├── not-found.ts
    │   └── error-handler.ts
    ├── types/
    │   └── express.d.ts          # adds req.id and req.user
    ├── modules/
    │   ├── auth/                 # complete auth module (§III.8)
    │   └── notes/                # the module template (§III.9)
    ├── jobs/
    │   ├── jobs.schema.ts
    │   ├── registry.ts           # job types + payload schemas
    │   ├── queue.ts              # enqueue()
    │   ├── worker.ts             # polling worker with retries and backoff
    │   └── handlers.ts           # job type → service method
    └── ai/                       # Part IV
```

**Why feature folders (`modules/notes/…`) instead of layer folders (`controllers/`, `services/`…)?** Both are fine.
Feature folders win for one reason: to add a new entity, you copy one folder and rename it. Everything about
"notes" is in one place. The layers still exist; they're files inside the folder.

Every module has the same six files:

| File | Layer | Contains |
|------|-------|----------|
| `x.schema.ts` | Database | Drizzle tables, enums, row types |
| `x.types.ts` | Contract | Zod request schemas, DTO types, mappers (row → DTO) |
| `x.repository.ts` | Repository | Queries only |
| `x.service.ts` | Service | Business rules, transactions |
| `x.controller.ts` | Controller | HTTP ⇄ service |
| `x.routes.ts` | Routes | Paths + middleware |

## III.2 Project setup

```bash
pnpm init
pnpm add express cors helmet cookie-parser dotenv zod drizzle-orm pg bcrypt jsonwebtoken @anthropic-ai/sdk
pnpm add -D typescript tsx drizzle-kit @types/node @types/express @types/cors @types/cookie-parser @types/pg @types/bcrypt @types/jsonwebtoken
```

**`package.json`** (scripts section)
```json
{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/main.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/main.js",
    "typecheck": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "test": "tsx --test \"src/**/*.test.ts\""
  }
}
```

**`tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "esModuleInterop": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "sourceMap": true
  },
  "include": ["src"]
}
```
`noUncheckedIndexedAccess` makes `rows[0]` typed as `T | undefined`. It's annoying for a day and then saves you from
a whole class of "cannot read property of undefined" bugs.

**`drizzle.config.ts`**
```ts
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/**/*.schema.ts",
  out: "./drizzle",
  casing: "snake_case",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

**`.env.example`** (commit this; never commit `.env`)
```bash
NODE_ENV=development
PORT=7000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/quizforge
JWT_ACCESS_SECRET=change-me-to-a-random-string-of-at-least-32-characters
CORS_ORIGINS=http://localhost:3000
TRUST_PROXY=0
LOG_LEVEL=info
RUN_WORKER=true
AI_PROVIDER=fake           # fake | anthropic
AI_MODEL=claude-opus-5-5
ANTHROPIC_API_KEY=
AI_DAILY_COST_LIMIT_USD=5
```

**Migration workflow** (never edit the database by hand):
1. Change a `*.schema.ts` file.
2. `pnpm db:generate`: drizzle-kit writes a SQL migration into `drizzle/`.
3. **Read the generated SQL.** (Renames sometimes become drop + add, which would lose data.)
4. `pnpm db:migrate`, then commit the schema change and the migration together.

## III.3 Config

**`src/config/env.ts`**
```ts
import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(7000),
  DATABASE_URL: z.string().startsWith("postgres"),
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean)),
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  RUN_WORKER: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  AI_PROVIDER: z.enum(["fake", "anthropic"]).default("fake"),
  AI_MODEL: z.string().default("claude-opus-5-5"),
  ANTHROPIC_API_KEY: z.string().optional(),
  AI_DAILY_COST_LIMIT_USD: z.coerce.number().positive().default(5),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration:\n" + z.prettifyError(parsed.error));
  process.exit(1);
}

if (parsed.data.AI_PROVIDER === "anthropic" && !parsed.data.ANTHROPIC_API_KEY) {
  console.error("❌ AI_PROVIDER=anthropic requires ANTHROPIC_API_KEY");
  process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
```

**Why:** the app crashes at startup with a clear message, instead of failing at 2 a.m. when the first request
touches a missing variable. **Nothing else in the codebase reads `process.env`.**

## III.4 Database client & shared columns

**`src/db/client.ts`**
```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../config/env.js";
import { logger } from "../core/logger.js";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
  statement_timeout: 10_000, // no query may run longer than 10s
});

// An idle client erroring (e.g. DB restarted) must not crash the process.
pool.on("error", (err) => logger.error("postgres pool error", { err }));

export const db = drizzle({ client: pool, casing: "snake_case" });

export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];

/**
 * Anything that can run queries: the db itself or an open transaction.
 * Repositories accept an Executor so that services can run several repository
 * calls inside one transaction.
 */
export type Executor = Pick<Db, "select" | "insert" | "update" | "delete" | "execute">;

/** Return the single row, or throw: for INSERT … RETURNING, which always returns a row. */
export function one<T>(rows: T[]): T {
  const row = rows[0];
  if (row === undefined) throw new Error("Expected one row, got none");
  return row;
}

/** Return the first row or null: for lookups that may find nothing. */
export function maybeOne<T>(rows: T[]): T | null {
  return rows[0] ?? null;
}
```

**`src/db/columns.ts`**
```ts
import { timestamp, uuid } from "drizzle-orm/pg-core";

/** UUID primary key generated by Postgres. */
export const id = () => uuid().primaryKey().defaultRandom();

/**
 * timestamptz with millisecond precision. Precision 3 matters: JavaScript Dates only
 * hold milliseconds, and cursor pagination compares timestamps exactly. With the
 * default microsecond precision, a cursor built from a JS Date can skip rows.
 */
export const ts = () => timestamp({ withTimezone: true, precision: 3 });

export const timestamps = () => ({
  createdAt: ts().notNull().defaultNow(),
  updatedAt: ts()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
```

## III.5 Core utilities

**`src/core/errors.ts`**
```ts
/**
 * The only error type services throw on purpose. The error middleware turns it into
 * { error: { code, message, details } } with the right HTTP status.
 * Services stay HTTP-agnostic: they pick a factory by *meaning* (notFound, conflict),
 * never by writing res.status().
 */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (code: string, message: string, details?: unknown) =>
  new AppError(400, code, message, details);

export const unauthenticated = (code = "UNAUTHENTICATED", message = "Authentication required.") =>
  new AppError(401, code, message);

export const forbidden = (code = "FORBIDDEN", message = "You are not allowed to do this.") =>
  new AppError(403, code, message);

export const notFound = (code = "NOT_FOUND", message = "Resource not found.") =>
  new AppError(404, code, message);

/** 409: the resource is in the wrong state right now, or already exists. */
export const conflict = (code: string, message: string, details?: unknown) =>
  new AppError(409, code, message, details);

/** 422: the request breaks a business rule and will never succeed as sent. */
export const unprocessable = (code: string, message: string, details?: unknown) =>
  new AppError(422, code, message, details);

export const tooManyRequests = (code: string, message: string, details?: unknown) =>
  new AppError(429, code, message, details);

export const serviceUnavailable = (code: string, message: string) =>
  new AppError(503, code, message);

/** Thrown by job handlers for failures that retrying cannot fix (bad data, deleted rows). */
export class PermanentJobError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermanentJobError";
  }
}
```

**`src/core/http.ts`**
```ts
import type { Response } from "express";

export type Meta = Record<string, unknown>;
export type ApiSuccess<T> = { data: T; meta?: Meta };
export type ApiErrorBody = { error: { code: string; message: string; details?: unknown } };

const body = <T>(data: T, meta?: Meta): ApiSuccess<T> => (meta ? { data, meta } : { data });

export const ok = <T>(res: Response, data: T, meta?: Meta) => res.status(200).json(body(data, meta));
export const created = <T>(res: Response, data: T) => res.status(201).json(body(data));
export const accepted = <T>(res: Response, data: T, location?: string) => {
  if (location) res.location(location);
  return res.status(202).json(body(data));
};
export const noContent = (res: Response) => res.status(204).end();
```

**`src/core/logger.ts`**
```ts
import { env } from "../config/env.js";

type Level = "debug" | "info" | "warn" | "error";
type Fields = Record<string, unknown>;

const rank: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const minRank = rank[env.LOG_LEVEL];

// Errors don't serialize with JSON.stringify by default (they become {}).
function replacer(_key: string, value: unknown) {
  if (value instanceof Error) return { name: value.name, message: value.message, stack: value.stack };
  if (typeof value === "bigint") return value.toString();
  return value;
}

function write(level: Level, msg: string, fields: Fields = {}) {
  if (rank[level] < minRank) return;
  const line = JSON.stringify({ time: new Date().toISOString(), level, msg, ...fields }, replacer);
  (level === "error" || level === "warn" ? process.stderr : process.stdout).write(line + "\n");
}

export const logger = {
  debug: (msg: string, fields?: Fields) => write("debug", msg, fields),
  info: (msg: string, fields?: Fields) => write("info", msg, fields),
  warn: (msg: string, fields?: Fields) => write("warn", msg, fields),
  error: (msg: string, fields?: Fields) => write("error", msg, fields),
};
```
One JSON object per line is what every log platform ingests. When you outgrow this, replace it with `pino`:
the call sites stay the same.

**`src/core/crypto.ts`**
```ts
import { createHash, randomBytes } from "node:crypto";

export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

/** URL-safe random token, 32 bytes = 256 bits of entropy by default. */
export const randomToken = (bytes = 32) => randomBytes(bytes).toString("base64url");
```

**`src/core/schemas.ts`**
```ts
import { z } from "zod";

/**
 * Validate :id params as UUIDs. Without this, "/notes/abc" reaches Postgres and
 * fails with "invalid input syntax for type uuid" → a 500 instead of a 400.
 */
export const IdParams = z.object({ id: z.uuid() });
```

**`src/core/pagination.ts`**
```ts
import { z } from "zod";
import { badRequest } from "./errors.js";

export type Cursor = { t: Date; id: string };

const CursorPayload = z.object({ t: z.iso.datetime(), id: z.uuid() });

export const PageQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().max(200).optional(),
});
export type PageQuery = z.infer<typeof PageQuery>;

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify({ t: cursor.t.toISOString(), id: cursor.id })).toString("base64url");
}

export function decodeCursor(raw: string | undefined): Cursor | null {
  if (!raw) return null;
  try {
    const parsed = CursorPayload.parse(JSON.parse(Buffer.from(raw, "base64url").toString("utf8")));
    return { t: new Date(parsed.t), id: parsed.id };
  } catch {
    throw badRequest("INVALID_CURSOR", "The pagination cursor is invalid.");
  }
}

/**
 * Repositories fetch limit + 1 rows. If we got the extra row, there's a next page.
 * The cursor is built from the last row we actually return.
 */
export function toPage<T>(rows: T[], limit: number, cursorOf: (row: T) => Cursor) {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items.at(-1);
  return { items, nextCursor: hasMore && last ? encodeCursor(cursorOf(last)) : null };
}
```

## III.6 Middleware

**`src/types/express.d.ts`**
```ts
import type { AuthUser } from "../modules/auth/tokens.js";

declare global {
  namespace Express {
    interface Request {
      /** Set by the requestId middleware on every request. */
      id: string;
      /** Set by requireAuth / optionalAuth when a valid access token is present. */
      user?: AuthUser;
    }
  }
}

export {};
```

**`src/middleware/request-id.ts`**
```ts
import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const requestId: RequestHandler = (req, res, next) => {
  const incoming = req.header("x-request-id");
  // Accept the caller's id only if it looks safe; otherwise generate one.
  req.id = incoming && /^[\w-]{1,100}$/.test(incoming) ? incoming : randomUUID();
  res.setHeader("x-request-id", req.id);
  next();
};
```

**`src/middleware/request-logger.ts`**
```ts
import type { RequestHandler } from "express";
import { logger } from "../core/logger.js";

export const requestLogger: RequestHandler = (req, res, next) => {
  const start = performance.now();
  res.on("finish", () => {
    logger.info("request", {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl.split("?")[0], // never log query strings: they may contain tokens
      status: res.statusCode,
      durationMs: Math.round(performance.now() - start),
      userId: req.user?.id,
    });
  });
  next();
};
```

**`src/middleware/auth.ts`**
```ts
import type { Request, RequestHandler } from "express";
import { forbidden, unauthenticated } from "../core/errors.js";
import { verifyAccessToken, type AuthUser } from "../modules/auth/tokens.js";

function readBearer(req: Request): string | null {
  const header = req.header("authorization");
  return header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
}

/** 401 unless a valid access token is present. Answers "who are you?", never "may you do this?". */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = readBearer(req);
  if (!token) throw unauthenticated();
  req.user = verifyAccessToken(token);
  next();
};

/** Sets req.user when a valid token is present; continues anonymously otherwise. */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = readBearer(req);
  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // An invalid token on a public route is treated as anonymous.
    }
  }
  next();
};

export const requireRole =
  (role: AuthUser["role"]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) throw unauthenticated();
    if (req.user.role !== role) throw forbidden();
    next();
  };

/** Use in controllers behind requireAuth. Gives a typed user without the `!` operator. */
export function currentUser(req: Request): AuthUser {
  if (!req.user) throw unauthenticated();
  return req.user;
}
```

> **Ownership is NOT middleware.** "Is this note yours?" needs the note, which needs the database, and it's a
> business rule. That makes it a service concern. Middleware answers *who you are*; services answer *what you may do*.

**`src/middleware/rate-limit.ts`**
```ts
import type { Request, RequestHandler } from "express";
import { tooManyRequests } from "../core/errors.js";

type Options = {
  windowMs: number;
  max: number;
  key: (req: Request) => string;
  code?: string;
};

/**
 * Fixed-window, in-memory rate limiter. Correct for a single server process.
 * When you run several instances, move the counters to Redis or Postgres.
 * The interface (a middleware) stays the same, which makes this a seam.
 */
export function rateLimit({ windowMs, max, key, code = "RATE_LIMITED" }: Options): RequestHandler {
  const hits = new Map<string, { count: number; resetAt: number }>();

  // Sweep expired entries so the map doesn't grow forever.
  setInterval(() => {
    const now = Date.now();
    for (const [k, entry] of hits) if (entry.resetAt <= now) hits.delete(k);
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const k = key(req);
    let entry = hits.get(k);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(k, entry);
    }
    entry.count += 1;

    res.setHeader("RateLimit-Limit", String(max));
    res.setHeader("RateLimit-Remaining", String(Math.max(0, max - entry.count)));

    if (entry.count > max) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSeconds));
      throw tooManyRequests(code, "Too many requests. Please slow down.", { retryAfterSeconds });
    }
    next();
  };
}
```

**`src/middleware/not-found.ts`**
```ts
import type { RequestHandler } from "express";

export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: `Route ${req.method} ${req.path} not found.` } });
};
```

**`src/middleware/error-handler.ts`**
```ts
import type { ErrorRequestHandler } from "express";
import { ZodError, z } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../core/errors.js";
import { logger } from "../core/logger.js";

/** Postgres error codes may be on the error itself or on its `cause` (ORM wrappers). */
function pgCode(err: unknown): string | undefined {
  let current: unknown = err;
  for (let depth = 0; depth < 3 && current && typeof current === "object"; depth++) {
    const code = (current as { code?: unknown }).code;
    if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) return code;
    current = (current as { cause?: unknown }).cause;
  }
  return undefined;
}

/**
 * The single place where errors become HTTP responses. Must be registered LAST.
 * Express 5 forwards errors thrown in async handlers here automatically.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // If streaming already started (SSE), we can't send JSON anymore.
  if (res.headersSent) return next(err);

  const send = (status: number, code: string, message: string, details?: unknown) =>
    res.status(status).json({ error: { code, message, ...(details !== undefined && { details }) } });

  if (err instanceof AppError) {
    if (err.status >= 500) logger.error("app error", { requestId: req.id, err });
    return send(err.status, err.code, err.message, err.details);
  }

  if (err instanceof ZodError) {
    return send(400, "VALIDATION_ERROR", "Request validation failed.", z.flattenError(err));
  }

  // body-parser errors carry a `type` field
  const type = (err as { type?: string }).type;
  if (type === "entity.parse.failed") return send(400, "INVALID_JSON", "Request body is not valid JSON.");
  if (type === "entity.too.large") return send(413, "PAYLOAD_TOO_LARGE", "Request body is too large.");

  // Database constraint violations that slipped past service checks (e.g. race conditions)
  switch (pgCode(err)) {
    case "23505":
      return send(409, "CONFLICT", "This resource already exists.");
    case "23503":
      return send(409, "CONFLICT", "A related resource does not exist or is still in use.");
    case "22P02":
      return send(400, "VALIDATION_ERROR", "Invalid input format.");
  }

  logger.error("unhandled error", { requestId: req.id, path: req.originalUrl, err });
  return send(
    500,
    "INTERNAL_ERROR",
    "Something went wrong on our side.",
    env.NODE_ENV === "production" ? undefined : { message: (err as Error)?.message },
  );
};
```

## III.7 App, routes, entry point

**`src/app.ts`**
```ts
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { sql } from "drizzle-orm";
import { env } from "./config/env.js";
import { db } from "./db/client.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { rateLimit } from "./middleware/rate-limit.js";
import { requestId } from "./middleware/request-id.js";
import { requestLogger } from "./middleware/request-logger.js";
import { apiRouter } from "./routes.js";

export function createApp(): Express {
  const app = express();

  // Behind a load balancer/reverse proxy, this makes req.ip the real client IP.
  app.set("trust proxy", env.TRUST_PROXY);

  // ORDER MATTERS. Express runs middleware top to bottom.
  // 1. Things every request needs
  app.use(requestId);
  app.use(requestLogger);
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));
  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());
  app.use(rateLimit({ windowMs: 5 * 60_000, max: 300, key: (req) => req.ip ?? "unknown" }));

  // 2. Routes
  app.get("/health", async (_req, res) => {
    try {
      await db.execute(sql`select 1`);
      res.json({ data: { status: "ok", db: "ok" } });
    } catch {
      res.status(503).json({ data: { status: "degraded", db: "down" } });
    }
  });
  app.use("/api/v1", apiRouter);

  // 3. Fallbacks: ALWAYS last. 404 for unmatched routes, then the error handler.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
```

> ⚠️ **The most common Express bug:** registering the 404 handler or the error handler *before* the routes.
> The 404 handler matches every request, so your routes never run. Fallbacks always go last.

**`src/routes.ts`**
```ts
import { Router } from "express";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { notesRoutes } from "./modules/notes/notes.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/notes", notesRoutes);
// apiRouter.use("/quizzes", quizzesRoutes);
// apiRouter.use("/attempts", attemptsRoutes);
```

**`src/main.ts`**
```ts
import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./core/logger.js";
import { pool } from "./db/client.js";
import { jobHandlers } from "./jobs/handlers.js";
import { createWorker } from "./jobs/worker.js";

const server = createServer(createApp());
const worker = createWorker(jobHandlers);

server.listen(env.PORT, () => logger.info("server listening", { port: env.PORT, env: env.NODE_ENV }));
if (env.RUN_WORKER) void worker.start();

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info("shutting down", { signal });

  // If something hangs (e.g. an open SSE stream), force exit after 15s.
  setTimeout(() => {
    logger.error("forced shutdown after timeout");
    process.exit(1);
  }, 15_000).unref();

  await Promise.all([
    new Promise<void>((resolve) => server.close(() => resolve())), // stop accepting, finish in-flight
    worker.stop(), // finish the current job, take no new ones
  ]);
  await pool.end();
  logger.info("shutdown complete");
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => logger.error("unhandled rejection", { reason }));
```

## III.8 The auth module (complete)

Design recap: short-lived JWT access token (15 min) in the response body, plus a long-lived random refresh
token (7 days) in an `httpOnly` cookie, stored **hashed** in the database, **rotated** on every use, with
**reuse detection** (rule R4).

**Why two tokens?** The access token is checked on every request without a database lookup (fast), but it
can't be revoked, so it must be short-lived. The refresh token *can* be revoked (it's in the DB), so it can
live longer. Logout = revoke the refresh token; the access token dies within 15 minutes on its own.

**`src/modules/auth/auth.schema.ts`**
```ts
import { char, index, pgEnum, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps, ts } from "../../db/columns.js";

export const userRole = pgEnum("user_role", ["user", "admin"]);

export const users = pgTable("users", {
  id: id(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: text().notNull(),
  displayName: varchar({ length: 80 }).notNull(),
  role: userRole().notNull().default("user"),
  ...timestamps(),
});

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: char({ length: 64 }).notNull().unique(),
    expiresAt: ts().notNull(),
    revokedAt: ts(),
    replacedById: uuid(),
    createdAt: ts().notNull().defaultNow(),
  },
  (t) => [index("refresh_tokens_user_idx").on(t.userId)],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type RefreshTokenRow = typeof refreshTokens.$inferSelect;
```

**`src/modules/auth/auth.types.ts`**
```ts
import { z } from "zod";
import type { UserRow } from "./auth.schema.js";

const Email = z.string().trim().toLowerCase().max(255).pipe(z.email());

// ---------- Requests (IN) ----------
export const RegisterBody = z.strictObject({
  email: Email,
  password: z.string().min(8).max(72), // bcrypt only uses the first 72 bytes (R2)
  displayName: z.string().trim().min(1).max(80),
});
export type RegisterInput = z.infer<typeof RegisterBody>;

export const LoginBody = z.strictObject({
  email: Email,
  password: z.string().min(1).max(72),
});
export type LoginInput = z.infer<typeof LoginBody>;

// ---------- Responses (OUT) ----------
export type UserDto = {
  id: string;
  email: string;
  displayName: string;
  role: "user" | "admin";
  createdAt: string;
};

/** The ONLY way a user leaves the API. passwordHash can't leak because it's never copied. */
export const toUserDto = (row: UserRow): UserDto => ({
  id: row.id,
  email: row.email,
  displayName: row.displayName,
  role: row.role,
  createdAt: row.createdAt.toISOString(),
});
```

**`src/modules/auth/password.ts`**
```ts
import bcrypt from "bcrypt";

const COST = 12; // ~250ms per hash on a typical server. Raise it as hardware gets faster.

// Used when the email doesn't exist, so "unknown email" and "wrong password"
// take the same time. Otherwise attackers can find registered emails by timing.
const DUMMY_HASH = bcrypt.hashSync("timing-equalizer-not-a-real-password", COST);

export const hashPassword = (password: string) => bcrypt.hash(password, COST);

export const verifyPassword = (password: string, hash: string | null) =>
  bcrypt.compare(password, hash ?? DUMMY_HASH);
```

**`src/modules/auth/tokens.ts`**
```ts
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { unauthenticated } from "../../core/errors.js";

export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

export type AuthUser = { id: string; role: "user" | "admin" };

export function signAccessToken(user: AuthUser): string {
  return jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, {
    subject: user.id,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
    algorithm: "HS256",
  });
}

export function verifyAccessToken(token: string): AuthUser {
  try {
    // Pin the algorithm: never let the token's header choose it.
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ["HS256"] });
    if (typeof payload === "string" || !payload.sub) throw new Error("Malformed token payload");
    return { id: payload.sub, role: payload.role === "admin" ? "admin" : "user" };
  } catch {
    throw unauthenticated("UNAUTHENTICATED", "Your session is invalid or has expired.");
  }
}
```

**`src/modules/auth/auth.repository.ts`**
```ts
import { and, eq, isNull } from "drizzle-orm";
import { db, maybeOne, one, type Executor } from "../../db/client.js";
import { refreshTokens, users, type NewUserRow } from "./auth.schema.js";

export const usersRepo = {
  async findByEmail(email: string, ex: Executor = db) {
    return maybeOne(await ex.select().from(users).where(eq(users.email, email)).limit(1));
  },

  async findById(id: string, ex: Executor = db) {
    return maybeOne(await ex.select().from(users).where(eq(users.id, id)).limit(1));
  },

  async insert(values: NewUserRow, ex: Executor = db) {
    return one(await ex.insert(users).values(values).returning());
  },
};

export const refreshTokensRepo = {
  async insert(values: { userId: string; tokenHash: string; expiresAt: Date }, ex: Executor = db) {
    return one(await ex.insert(refreshTokens).values(values).returning());
  },

  async findByHash(tokenHash: string, ex: Executor = db) {
    return maybeOne(
      await ex.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash)).limit(1),
    );
  },

  /** Revokes only if not already revoked. Returns false if someone else revoked it first. */
  async revoke(id: string, replacedById: string | null, ex: Executor = db) {
    const rows = await ex
      .update(refreshTokens)
      .set({ revokedAt: new Date(), replacedById })
      .where(and(eq(refreshTokens.id, id), isNull(refreshTokens.revokedAt)))
      .returning({ id: refreshTokens.id });
    return rows.length > 0;
  },

  async revokeAllForUser(userId: string, ex: Executor = db) {
    await ex
      .update(refreshTokens)
      .set({ revokedAt: new Date() })
      .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
  },
};
```

**`src/modules/auth/auth.service.ts`**
```ts
import { conflict, notFound, unauthenticated } from "../../core/errors.js";
import { randomToken, sha256 } from "../../core/crypto.js";
import { logger } from "../../core/logger.js";
import { db, type Executor } from "../../db/client.js";
import { refreshTokensRepo, usersRepo } from "./auth.repository.js";
import type { UserRow } from "./auth.schema.js";
import type { LoginInput, RegisterInput } from "./auth.types.js";
import { hashPassword, verifyPassword } from "./password.js";
import { REFRESH_TOKEN_TTL_SECONDS, signAccessToken } from "./tokens.js";

export type AuthResult = { user: UserRow; accessToken: string; refreshToken: string };

const invalidRefresh = () =>
  unauthenticated("INVALID_REFRESH_TOKEN", "Your session has expired. Please log in again.");

async function issueRefreshToken(userId: string, ex: Executor = db) {
  const raw = randomToken();
  const row = await refreshTokensRepo.insert(
    { userId, tokenHash: sha256(raw), expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000) },
    ex,
  );
  return { raw, row }; // raw goes to the cookie; only the hash is stored
}

export const authService = {
  /** R1, R2, R3 */
  async register(input: RegisterInput): Promise<AuthResult> {
    // Friendly error for the common case. The UNIQUE constraint still catches the race
    // where two requests register the same email at the same time (→ 409 CONFLICT).
    if (await usersRepo.findByEmail(input.email)) {
      throw conflict("EMAIL_TAKEN", "An account with this email already exists.");
    }
    const passwordHash = await hashPassword(input.password); // slow: do it OUTSIDE the transaction

    return db.transaction(async (tx) => {
      const user = await usersRepo.insert(
        { email: input.email, passwordHash, displayName: input.displayName },
        tx,
      );
      const refresh = await issueRefreshToken(user.id, tx);
      return { user, accessToken: signAccessToken(user), refreshToken: refresh.raw };
    });
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await usersRepo.findByEmail(input.email);
    const valid = await verifyPassword(input.password, user?.passwordHash ?? null);
    if (!user || !valid) {
      // Same error for both cases: don't reveal which emails are registered.
      throw unauthenticated("INVALID_CREDENTIALS", "Email or password is incorrect.");
    }
    const refresh = await issueRefreshToken(user.id);
    return { user, accessToken: signAccessToken(user), refreshToken: refresh.raw };
  },

  /** R4: rotate on every use; reuse of a rotated token revokes every session. */
  async refresh(rawToken: string | undefined): Promise<AuthResult> {
    if (!rawToken) throw invalidRefresh();

    const existing = await refreshTokensRepo.findByHash(sha256(rawToken));
    if (!existing || existing.expiresAt <= new Date()) throw invalidRefresh();

    if (existing.revokedAt) {
      // A token that was already rotated is being used again. Either the user has
      // two tabs racing, or the token was stolen. Assume theft: log everyone out.
      await refreshTokensRepo.revokeAllForUser(existing.userId);
      logger.warn("refresh token reuse detected", { userId: existing.userId });
      throw invalidRefresh();
    }

    const user = await usersRepo.findById(existing.userId);
    if (!user) throw invalidRefresh();

    return db.transaction(async (tx) => {
      const next = await issueRefreshToken(user.id, tx);
      const revoked = await refreshTokensRepo.revoke(existing.id, next.row.id, tx);
      if (!revoked) throw invalidRefresh(); // a concurrent request won the race → rollback
      return { user, accessToken: signAccessToken(user), refreshToken: next.raw };
    });
  },

  /** Idempotent: logging out twice, or with no cookie, is fine. */
  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const existing = await refreshTokensRepo.findByHash(sha256(rawToken));
    if (existing) await refreshTokensRepo.revoke(existing.id, null);
  },

  async me(userId: string): Promise<UserRow> {
    const user = await usersRepo.findById(userId);
    if (!user) throw notFound("USER_NOT_FOUND", "User not found.");
    return user;
  },
};
```

**`src/modules/auth/auth.controller.ts`**
```ts
import type { CookieOptions, Request, Response } from "express";
import { env } from "../../config/env.js";
import { created, noContent, ok } from "../../core/http.js";
import { currentUser } from "../../middleware/auth.js";
import { authService } from "./auth.service.js";
import { LoginBody, RegisterBody, toUserDto } from "./auth.types.js";
import { REFRESH_TOKEN_TTL_SECONDS } from "./tokens.js";

const COOKIE_NAME = "refresh_token";
const cookieOptions: CookieOptions = {
  httpOnly: true, // JavaScript can't read it → XSS can't steal it
  secure: env.NODE_ENV === "production", // HTTPS only in production
  sameSite: "strict", // not sent on cross-site requests → CSRF protection
  path: "/api/v1/auth", // only sent to auth endpoints
};

const readRefreshCookie = (req: Request): string | undefined => {
  const value: unknown = req.cookies?.[COOKIE_NAME];
  return typeof value === "string" ? value : undefined;
};

const setRefreshCookie = (res: Response, token: string) =>
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000 });

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(RegisterBody.parse(req.body));
    setRefreshCookie(res, result.refreshToken);
    created(res, { user: toUserDto(result.user), accessToken: result.accessToken });
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(LoginBody.parse(req.body));
    setRefreshCookie(res, result.refreshToken);
    ok(res, { user: toUserDto(result.user), accessToken: result.accessToken });
  },

  async refresh(req: Request, res: Response) {
    const result = await authService.refresh(readRefreshCookie(req));
    setRefreshCookie(res, result.refreshToken);
    ok(res, { accessToken: result.accessToken });
  },

  async logout(req: Request, res: Response) {
    await authService.logout(readRefreshCookie(req));
    res.clearCookie(COOKIE_NAME, cookieOptions);
    noContent(res);
  },

  async me(req: Request, res: Response) {
    ok(res, toUserDto(await authService.me(currentUser(req).id)));
  },
};
```

**`src/modules/auth/auth.routes.ts`**
```ts
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { rateLimit } from "../../middleware/rate-limit.js";
import { authController } from "./auth.controller.js";

const credentialsLimiter = rateLimit({
  windowMs: 15 * 60_000,
  max: 10,
  key: (req) => `auth:${req.ip}`,
});

export const authRoutes = Router()
  .post("/register", credentialsLimiter, authController.register)
  .post("/login", credentialsLimiter, authController.login)
  .post("/refresh", authController.refresh)
  .post("/logout", authController.logout)
  .get("/me", requireAuth, authController.me);
```

**Try it:**
```bash
curl -i -c jar.txt -X POST localhost:7000/api/v1/auth/register \
  -H 'content-type: application/json' \
  -d '{"email":"riya@example.com","password":"correct-horse-9","displayName":"Riya"}'

curl localhost:7000/api/v1/auth/me -H "authorization: Bearer <accessToken from above>"
curl -i -b jar.txt -c jar.txt -X POST localhost:7000/api/v1/auth/refresh
```

## III.9 The module template (copy this for every entity)

This is the most reused code in the file. `notes` is the example. To add `projects`, `expenses`, or `tickets`,
copy the folder and follow the checklist at the end.

**`src/modules/notes/notes.schema.ts`**
```ts
import { index, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { id, timestamps } from "../../db/columns.js";
import { users } from "../auth/auth.schema.js";

export const notes = pgTable(
  "notes",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // owner
    title: varchar({ length: 200 }).notNull(),
    content: text().notNull(),
    ...timestamps(),
  },
  // Serves: "list my notes, most recently edited first" (the main read path)
  (t) => [index("notes_user_updated_idx").on(t.userId, t.updatedAt.desc(), t.id)],
);

export type NoteRow = typeof notes.$inferSelect;
export type NewNoteRow = typeof notes.$inferInsert;
```

**`src/modules/notes/notes.types.ts`**
```ts
import { z } from "zod";
import { PageQuery } from "../../core/pagination.js";
import type { NoteRow } from "./notes.schema.js";

// ---------- IN ----------
export const CreateNoteBody = z.strictObject({
  title: z.string().trim().min(1).max(200),
  content: z.string().min(1).max(50_000),
});
export type CreateNoteInput = z.infer<typeof CreateNoteBody>;

export const UpdateNoteBody = CreateNoteBody.partial().refine((body) => Object.keys(body).length > 0, {
  message: "Provide at least one field to update.",
});
export type UpdateNoteInput = z.infer<typeof UpdateNoteBody>;

export const ListNotesQuery = PageQuery;

// ---------- OUT ----------
export type NoteDto = { id: string; title: string; content: string; createdAt: string; updatedAt: string };
export type NoteListItemDto = { id: string; title: string; preview: string; createdAt: string; updatedAt: string };

export const toNoteDto = (row: NoteRow): NoteDto => ({
  id: row.id,
  title: row.title,
  content: row.content,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});

export const toNoteListItemDto = (row: {
  id: string;
  title: string;
  preview: string;
  createdAt: Date;
  updatedAt: Date;
}): NoteListItemDto => ({
  id: row.id,
  title: row.title,
  preview: row.preview,
  createdAt: row.createdAt.toISOString(),
  updatedAt: row.updatedAt.toISOString(),
});
```

**`src/modules/notes/notes.repository.ts`**
```ts
import { and, count, desc, eq, lt, or, sql } from "drizzle-orm";
import type { Cursor } from "../../core/pagination.js";
import { db, maybeOne, one, type Executor } from "../../db/client.js";
import { notes, type NewNoteRow } from "./notes.schema.js";

export const notesRepo = {
  /** Keyset pagination: (updated_at, id) < cursor. Fetches limit + 1 to detect a next page. */
  async listByUser(userId: string, opts: { limit: number; cursor: Cursor | null }, ex: Executor = db) {
    const afterCursor = opts.cursor
      ? or(
          lt(notes.updatedAt, opts.cursor.t),
          and(eq(notes.updatedAt, opts.cursor.t), lt(notes.id, opts.cursor.id)),
        )
      : undefined;

    return ex
      .select({
        id: notes.id,
        title: notes.title,
        preview: sql<string>`left(${notes.content}, 160)`, // don't ship 50 KB per list item
        createdAt: notes.createdAt,
        updatedAt: notes.updatedAt,
      })
      .from(notes)
      .where(and(eq(notes.userId, userId), afterCursor))
      .orderBy(desc(notes.updatedAt), desc(notes.id))
      .limit(opts.limit + 1);
  },

  async countByUser(userId: string, ex: Executor = db) {
    const [row] = await ex.select({ n: count() }).from(notes).where(eq(notes.userId, userId));
    return row?.n ?? 0;
  },

  /** Owner-scoped lookup: another user's note is indistinguishable from a missing one. */
  async findOwned(id: string, userId: string, ex: Executor = db) {
    return maybeOne(
      await ex.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, userId))).limit(1),
    );
  },

  async insert(values: NewNoteRow, ex: Executor = db) {
    return one(await ex.insert(notes).values(values).returning());
  },

  async updateOwned(id: string, userId: string, patch: Partial<Pick<NewNoteRow, "title" | "content">>, ex: Executor = db) {
    return maybeOne(
      await ex.update(notes).set(patch).where(and(eq(notes.id, id), eq(notes.userId, userId))).returning(),
    );
  },

  async deleteOwned(id: string, userId: string, ex: Executor = db) {
    const rows = await ex
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning({ id: notes.id });
    return rows.length > 0;
  },
};
```

**`src/modules/notes/notes.service.ts`**
```ts
import { notFound, unprocessable } from "../../core/errors.js";
import { decodeCursor, toPage, type PageQuery } from "../../core/pagination.js";
import { notesRepo } from "./notes.repository.js";
import type { CreateNoteInput, UpdateNoteInput } from "./notes.types.js";

const MAX_NOTES_PER_USER = 200; // R7

const noteNotFound = () => notFound("NOTE_NOT_FOUND", "Note not found.");

export const notesService = {
  async list(userId: string, query: PageQuery) {
    const rows = await notesRepo.listByUser(userId, { limit: query.limit, cursor: decodeCursor(query.cursor) });
    return toPage(rows, query.limit, (row) => ({ t: row.updatedAt, id: row.id }));
  },

  /** R6 (Zod), R7 */
  async create(userId: string, input: CreateNoteInput) {
    // Soft limit: two parallel requests at 199 could both pass. That's acceptable for a
    // limit like this. For a hard limit (money, inventory), lock the parent row first.
    if ((await notesRepo.countByUser(userId)) >= MAX_NOTES_PER_USER) {
      throw unprocessable("NOTE_LIMIT_REACHED", `You can have at most ${MAX_NOTES_PER_USER} notes.`, {
        limit: MAX_NOTES_PER_USER,
      });
    }
    return notesRepo.insert({ userId, ...input });
  },

  /** R5: owner only, others get 404 */
  async getOwned(userId: string, id: string) {
    const note = await notesRepo.findOwned(id, userId);
    if (!note) throw noteNotFound();
    return note;
  },

  async update(userId: string, id: string, patch: UpdateNoteInput) {
    const note = await notesRepo.updateOwned(id, userId, patch);
    if (!note) throw noteNotFound();
    return note;
  },

  async remove(userId: string, id: string) {
    if (!(await notesRepo.deleteOwned(id, userId))) throw noteNotFound();
  },
};
```

**`src/modules/notes/notes.controller.ts`**
```ts
import type { Request, Response } from "express";
import { created, noContent, ok } from "../../core/http.js";
import { IdParams } from "../../core/schemas.js";
import { currentUser } from "../../middleware/auth.js";
import { notesService } from "./notes.service.js";
import { CreateNoteBody, ListNotesQuery, UpdateNoteBody, toNoteDto, toNoteListItemDto } from "./notes.types.js";

// Every function: parse input → call ONE service method → map → respond. Nothing else.
export const notesController = {
  async list(req: Request, res: Response) {
    const page = await notesService.list(currentUser(req).id, ListNotesQuery.parse(req.query));
    ok(res, page.items.map(toNoteListItemDto), { nextCursor: page.nextCursor });
  },

  async create(req: Request, res: Response) {
    const note = await notesService.create(currentUser(req).id, CreateNoteBody.parse(req.body));
    created(res, toNoteDto(note));
  },

  async get(req: Request, res: Response) {
    const { id } = IdParams.parse(req.params);
    ok(res, toNoteDto(await notesService.getOwned(currentUser(req).id, id)));
  },

  async update(req: Request, res: Response) {
    const { id } = IdParams.parse(req.params);
    const note = await notesService.update(currentUser(req).id, id, UpdateNoteBody.parse(req.body));
    ok(res, toNoteDto(note));
  },

  async remove(req: Request, res: Response) {
    const { id } = IdParams.parse(req.params);
    await notesService.remove(currentUser(req).id, id);
    noContent(res);
  },
};
```

**`src/modules/notes/notes.routes.ts`**
```ts
import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { notesController } from "./notes.controller.js";

export const notesRoutes = Router()
  .use(requireAuth)
  .get("/", notesController.list)
  .post("/", notesController.create)
  .get("/:id", notesController.get)
  .patch("/:id", notesController.update)
  .delete("/:id", notesController.remove);
```

### Why validate in the controller instead of a validation middleware?
`CreateNoteBody.parse(req.body)` gives you a **typed** value in one line. A generic `validate()` middleware has to
put the result back onto `req`, where TypeScript loses the type, so you end up casting anyway. A thrown
`ZodError` becomes a `400 VALIDATION_ERROR` in the error handler either way. Fewer moving parts, full type
safety. (Both approaches are common; pick one and use it everywhere.)

### Checklist: adding a new entity with the template
1. Copy `modules/notes/` to `modules/<entity>/` and rename the files and identifiers.
2. **Schema:** columns from your design doc (Step 7), FKs with `onDelete`, indexes for the read paths.
3. `pnpm db:generate`, read the SQL, `pnpm db:migrate`.
4. **Types:** Zod bodies from the endpoint catalog (Step 9); DTOs exactly matching the response examples.
5. **Repository:** one function per query the service needs. Owner-scoped lookups take `userId`.
6. **Service:** one method per use-case verb. Every `if` cites a rule number in a comment.
7. **Controller + routes:** copy the pattern; mount the router in `src/routes.ts`.
8. Test every endpoint with curl, including the error cases from the catalog.
9. Commit: `feat(<entity>): <use cases covered>`.

## III.10 The job queue (Postgres-backed)

Design recap: a `jobs` table *is* the queue. A request inserts a job **in the same transaction** as the change
that needs it. A worker loop claims one job at a time with `FOR UPDATE SKIP LOCKED` (so multiple workers never
take the same job), runs the handler, and retries failures with exponential backoff.

**`src/jobs/jobs.schema.ts`**
```ts
import { index, jsonb, pgEnum, pgTable, smallint, text, varchar } from "drizzle-orm/pg-core";
import { id, ts } from "../db/columns.js";

export const jobStatus = pgEnum("job_status", ["pending", "running", "completed", "failed"]);

export const jobs = pgTable(
  "jobs",
  {
    id: id(),
    type: varchar({ length: 50 }).notNull(),
    payload: jsonb().$type<Record<string, unknown>>().notNull(),
    status: jobStatus().notNull().default("pending"),
    attempts: smallint().notNull().default(0),
    maxAttempts: smallint().notNull().default(3),
    runAt: ts().notNull().defaultNow(),
    lockedAt: ts(),
    lastError: text(),
    createdAt: ts().notNull().defaultNow(),
    completedAt: ts(),
  },
  (t) => [index("jobs_poll_idx").on(t.status, t.runAt)],
);
```

**`src/jobs/registry.ts`**: every job type and its payload schema, in one place.
```ts
import { z } from "zod";

export const JobPayloads = {
  "quiz.generate": z.object({ quizId: z.uuid() }),
  "attempt.grade": z.object({ attemptId: z.uuid() }),
} satisfies Record<string, z.ZodType>;

export type JobType = keyof typeof JobPayloads;
export type JobPayload<T extends JobType> = z.infer<(typeof JobPayloads)[T]>;

export const isJobType = (type: string): type is JobType => Object.hasOwn(JobPayloads, type);

export type JobContext = { jobId: string; attempt: number; maxAttempts: number };

export type JobHandler<T extends JobType> = {
  /** Must be idempotent: assume it can run twice for the same payload. */
  run(payload: JobPayload<T>, ctx: JobContext): Promise<void>;
  /** Called once, when the job has failed for the last time. Use it to mark domain rows as failed. */
  onFinalFailure?(payload: JobPayload<T>, error: Error): Promise<void>;
};

export type JobHandlers = { [T in JobType]: JobHandler<T> };
```

**`src/jobs/queue.ts`**
```ts
import { db, one, type Executor } from "../db/client.js";
import { jobs } from "./jobs.schema.js";
import type { JobPayload, JobType } from "./registry.js";

/**
 * Pass the transaction (`tx`) when the job must exist if and only if the surrounding
 * change commits. That's almost always.
 */
export async function enqueue<T extends JobType>(
  type: T,
  payload: JobPayload<T>,
  ex: Executor = db,
  opts: { maxAttempts?: number; runAt?: Date } = {},
): Promise<string> {
  const row = one(
    await ex
      .insert(jobs)
      .values({ type, payload, maxAttempts: opts.maxAttempts ?? 3, runAt: opts.runAt ?? new Date() })
      .returning({ id: jobs.id }),
  );
  return row.id;
}
```

**`src/jobs/worker.ts`**
```ts
import { and, eq, lt, sql } from "drizzle-orm";
import { PermanentJobError } from "../core/errors.js";
import { logger } from "../core/logger.js";
import { db } from "../db/client.js";
import { jobs } from "./jobs.schema.js";
import { JobPayloads, isJobType, type JobContext, type JobHandlers } from "./registry.js";

type ClaimedJob = { id: string; type: string; payload: unknown; attempts: number; max_attempts: number };

type AnyHandler = {
  run(payload: unknown, ctx: JobContext): Promise<void>;
  onFinalFailure?(payload: unknown, error: Error): Promise<void>;
};

const BASE_BACKOFF_MS = 10_000; // 10s, 40s, 160s, …

export function createWorker(
  handlers: JobHandlers,
  opts: { pollMs?: number; stuckAfterMs?: number } = {},
) {
  const pollMs = opts.pollMs ?? 1_000;
  const stuckAfterMs = opts.stuckAfterMs ?? 10 * 60_000;

  let running = false;
  let timer: NodeJS.Timeout | undefined;
  let current: Promise<void> | undefined;

  /** Atomically take the oldest due job. SKIP LOCKED: two workers never get the same row. */
  async function claim(): Promise<ClaimedJob | null> {
    const result = await db.execute<ClaimedJob>(sql`
      UPDATE jobs
      SET status = 'running', locked_at = now(), attempts = attempts + 1
      WHERE id = (
        SELECT id FROM jobs
        WHERE status = 'pending' AND run_at <= now()
        ORDER BY run_at
        LIMIT 1
        FOR UPDATE SKIP LOCKED
      )
      RETURNING id, type, payload, attempts, max_attempts
    `);
    return result.rows[0] ?? null;
  }

  async function runOne(job: ClaimedJob) {
    const ctx: JobContext = { jobId: job.id, attempt: job.attempts, maxAttempts: job.max_attempts };
    let payload: unknown = job.payload;
    try {
      if (!isJobType(job.type)) throw new PermanentJobError(`Unknown job type: ${job.type}`);
      payload = JobPayloads[job.type].parse(job.payload);
      // Safe cast: the payload was validated by the schema registered for this exact type.
      const handler = handlers[job.type] as unknown as AnyHandler;
      await handler.run(payload, ctx);
      await db
        .update(jobs)
        .set({ status: "completed", completedAt: new Date(), lockedAt: null })
        .where(eq(jobs.id, job.id));
    } catch (thrown) {
      const error = thrown instanceof Error ? thrown : new Error(String(thrown));
      const isFinal = error instanceof PermanentJobError || job.attempts >= job.max_attempts;

      if (isFinal) {
        await db
          .update(jobs)
          .set({ status: "failed", lastError: error.message, lockedAt: null, completedAt: new Date() })
          .where(eq(jobs.id, job.id));
        if (isJobType(job.type)) {
          const handler = handlers[job.type] as unknown as AnyHandler;
          await handler.onFinalFailure?.(payload, error).catch((hookError: unknown) =>
            logger.error("onFinalFailure hook failed", { jobId: job.id, err: hookError }),
          );
        }
        logger.error("job failed permanently", { jobId: job.id, type: job.type, attempts: job.attempts, err: error });
      } else {
        const delayMs = BASE_BACKOFF_MS * 4 ** (job.attempts - 1);
        await db
          .update(jobs)
          .set({ status: "pending", lastError: error.message, lockedAt: null, runAt: new Date(Date.now() + delayMs) })
          .where(eq(jobs.id, job.id));
        logger.warn("job failed, will retry", { jobId: job.id, type: job.type, attempt: job.attempts, delayMs, err: error });
      }
    }
  }

  async function tick() {
    if (!running) return;
    let didWork = false;
    try {
      const job = await claim();
      if (job) {
        didWork = true;
        current = runOne(job);
        await current;
        current = undefined;
      }
    } catch (err) {
      logger.error("worker tick failed", { err }); // e.g. database briefly unavailable
    }
    // Busy? check again immediately. Idle? wait before polling again.
    if (running) timer = setTimeout(() => void tick(), didWork ? 0 : pollMs);
  }

  /** Jobs left 'running' by a crashed process go back to 'pending'. */
  async function recoverStuckJobs() {
    const cutoff = new Date(Date.now() - stuckAfterMs);
    await db
      .update(jobs)
      .set({ status: "pending", lockedAt: null })
      .where(and(eq(jobs.status, "running"), lt(jobs.lockedAt, cutoff)));
  }

  return {
    async start() {
      running = true;
      await recoverStuckJobs();
      logger.info("worker started", { pollMs });
      void tick();
    },
    async stop() {
      running = false;
      if (timer) clearTimeout(timer);
      if (current) await current; // let the in-flight job finish
      logger.info("worker stopped");
    },
  };
}
```

**`src/jobs/handlers.ts`** (QuizForge wiring; the services come from your modules)
```ts
import { attemptsService } from "../modules/attempts/attempts.service.js";
import { quizzesService } from "../modules/quizzes/quizzes.service.js";
import type { JobHandlers } from "./registry.js";

export const jobHandlers: JobHandlers = {
  "quiz.generate": {
    run: ({ quizId }) => quizzesService.generate(quizId),
    onFinalFailure: ({ quizId }, error) => quizzesService.markFailed(quizId, error),
  },
  "attempt.grade": {
    run: ({ attemptId }) => attemptsService.gradeShortAnswers(attemptId),
    onFinalFailure: ({ attemptId }) => attemptsService.failRemainingGrades(attemptId),
  },
};
```

> **When to replace this with Redis/BullMQ:** when you need thousands of jobs per second, delayed jobs at large
> scale, or many separate worker services. Until then, one Postgres table gives you something Redis can't:
> **transactional enqueue**. The job exists if and only if the business change committed.

---
