# Noticeboard — Feature Documentation

An institutional **policy noticeboard portal** built on Next.js 16 (App Router) + MongoDB.
Authenticated students and staff browse, search, and download official policy documents;
administrators manage the policy catalogue, category taxonomy, and user accounts.

- **Version:** 0.1.0 (private)
- **Runtime:** Next.js 16.2.12 · React 19.2.4 · Node 20 (Docker)
- **Database:** MongoDB 6.x (native driver, with Mongoose schemas declared alongside)
- **Auth:** Auth.js / NextAuth v5 beta (JWT sessions)
- **Styling:** Tailwind CSS v4 + shadcn (`radix-nova` style) + Radix UI primitives + Lucide icons

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Route Map](#3-route-map)
4. [Feature: Policy Portal (Home)](#4-feature-policy-portal-home)
5. [Feature: Policy Detail Page](#5-feature-policy-detail-page)
6. [Feature: Admin Policy Management](#6-feature-admin-policy-management)
7. [Feature: Category Management](#7-feature-category-management)
8. [Feature: Bulk User Import (Excel/CSV)](#8-feature-bulk-user-import-excelcsv)
9. [Feature: Dynamic Forms Engine](#9-feature-dynamic-forms-engine)
10. [Feature: File Storage & Download Proxy](#10-feature-file-storage--download-proxy)
11. [Data Model](#11-data-model)
12. [Server Actions Reference](#12-server-actions-reference)
13. [API Routes Reference](#13-api-routes-reference)
14. [Design System & UI Components](#14-design-system--ui-components)
15. [Configuration & Environment](#15-configuration--environment)
16. [Build & Deployment](#16-build--deployment)
17. [Known Gaps & Inconsistencies](#17-known-gaps--inconsistencies)

---

## 1. Architecture Overview

```
Browser
  │
  ├─ proxy.ts ─────────────► Auth.js session check on every request (Next 16 "Proxy",
  │                          formerly Middleware)
  │
  ├─ React Server Components (app/**/page.tsx)
  │     └─ getDb() ──► MongoDB native driver (shared MongoClient singleton)
  │
  ├─ Server Actions ("use server", app/actions/*.ts)
  │     ├─ auth() role gate
  │     ├─ MongoDB writes
  │     └─ revalidatePath() cache invalidation
  │
  └─ Route Handlers (app/api/**/route.ts)
        ├─ /api/auth/[...nextauth]  → Auth.js handlers
        └─ /api/download            → PDF streaming proxy
                                        │
                                        └─► AWS S3 / Google Drive
```

**Key architectural decisions**

| Decision | Detail |
| --- | --- |
| Data access | Raw MongoDB driver via `getDb()` in [lib/db.ts](lib/db.ts), not Mongoose at runtime. A `MongoClient` singleton is cached on `globalThis` in development to survive HMR. |
| Server-first | Pages are async RSCs that query Mongo directly and pass serialized (`JSON.parse(JSON.stringify(...))`) plain objects to client components. |
| Mutations | All writes go through `"use server"` Server Actions — no REST write endpoints exist. |
| Cache strategy | Policy pages use `export const revalidate = 0` (always dynamic); actions call `revalidatePath("/policy")` and `revalidatePath("/admin/policy")`. |
| Session strategy | `jwt` (not database sessions), so role is carried in the token, but the MongoDB adapter is still wired for account/verification-token persistence. |
| Output | `output: "standalone"` in [next.config.ts](next.config.ts) for a minimal Docker runtime image. |

---

## 2. Authentication & Authorization

Configured in [auth.ts](auth.ts). Three sign-in providers are registered.

### 2.1 Providers

| Provider | Notes |
| --- | --- |
| **Google OAuth** | `allowDangerousEmailAccountLinking: true`. A custom `profile()` mapper normalizes the Google payload and stamps a default `role: "user"`. |
| **Resend (magic link)** | Email sign-in via `AUTH_RESEND_KEY`; sender defaults to `onboarding@resend.dev` if `EMAIL_FROM` is unset. |
| **Credentials** | Email + password. Looks up the lower-cased email in the `users` collection and verifies with `bcrypt.compare`. Returns `null` (generic failure) for missing user, missing password hash, or bad password. |

`providerMap` is exported for building provider buttons — it deliberately **filters out `credentials`** so only OAuth/email providers can be rendered as social buttons.

### 2.2 Invite-only access model

The portal is **closed registration**. The `signIn` callback enforces:

1. `credentials` sign-ins pass through (the `authorize()` step already validated them).
2. Google sign-ins are **rejected unless `profile.email_verified === true`**.
3. For all non-credentials providers, the email must already exist in the `users` collection. If there is no pre-provisioned user document, sign-in is denied.

The practical consequence: accounts must be created by an admin (see [Bulk User Import](#8-feature-bulk-user-import-excelcsv)) before anyone can log in with Google or a magic link.

### 2.3 Role propagation

```
authorize()/profile()  →  user.role
        │
        ▼
jwt callback     token.id = user.id;  token.role = user.role ?? "user"
        │
        ▼
session callback session.user.role = token.role;  session.user.id = token.id ?? token.sub
```

Roles are typed as `UserRole = "admin" | "user"` in [types/user.ts](types/user.ts), and the NextAuth `User`/`Session`/`JWT` interfaces are augmented in [types/auth.d.ts](types/auth.d.ts) so `session.user.role` is type-safe throughout the app.

### 2.4 Enforcement points

| Layer | Mechanism |
| --- | --- |
| Proxy | [proxy.ts](proxy.ts) re-exports `auth` as `proxy`, so Auth.js runs on every matched request and populates the session. |
| Page guard (user) | [app/page.tsx](app/page.tsx) — `redirect('/signin')` when there is no session. |
| Page guard (admin) | [app/admin/policy/page.tsx](app/admin/policy/page.tsx) and [app/admin/category/page.tsx](app/admin/category/page.tsx) — `redirect("/signin")` unless `session.user.role === "admin"`. |
| Action guard | Every mutating action re-checks the session server-side and throws `"Unauthorized access"` (or returns an error result) — the page guard is never trusted alone. |

### 2.5 Sign-in UX

- Custom pages: `pages.signIn = "/signin"`, `pages.error = "/signin"`.
- [app/signin/page.tsx](app/signin/page.tsx) is a split-screen layout — a background-image hero panel (`/background.png`) with "Noticeboard Portal" branding on one side, the form on the other; it stacks vertically on mobile.
- **Error code translation**: raw Auth.js error codes from `?error=` are mapped to human messages before rendering:

  | Code | Message |
  | --- | --- |
  | `CredentialsSignin` | Invalid email or password. |
  | `AccessDenied` / `OAuthAccountNotLinked` | Access denied. Account not registered or authorized. |
  | `OAuthSignin` | Could not start sign-in with that provider. Please try again. |
  | `OAuthCallbackError` | Could not complete sign-in with that provider. Please try again. |
  | `Verification` | That sign-in link is invalid or has expired. |
  | `Configuration` | Sign-in is temporarily unavailable. Please contact an administrator. |
  | *(anything else)* | An error occurred during authentication. |

- [components/LoginForm.tsx](components/LoginForm.tsx) is a client component with independent loading states for the credentials and Google buttons, inline error banners, `redirect: false` credential sign-in (so errors render in place instead of bouncing to the error page), `callbackUrl` pass-through, an inline Google logo SVG, and full dark-mode styling.
- `/login` is an alias that re-exports the `/signin` page component.
- `/signout` renders a confirmation prompt whose form action calls the server-side `signOut()`.

---

## 3. Route Map

| Route | Type | Auth | Description |
| --- | --- | --- | --- |
| `/` | RSC → client | Session required | Policy portal home: hero, search, quick-access categories, policy directory |
| `/signin` | RSC | Public | Sign-in page (credentials + Google + magic link) |
| `/login` | RSC | Public | Alias re-exporting `/signin` |
| `/signout` | RSC + server action | Public | Sign-out confirmation |
| `/policy?id=<ObjectId>` | RSC → client | Proxy-gated | Full policy detail page with live document viewer |
| `/forms/<ObjectId>` | RSC → client | *None* | Public dynamic form fill + submit |
| `/admin/policy` | RSC | **admin** | Policy CRUD console |
| `/admin/category` | RSC | **admin** | Category creation form |
| `/admin/upload` | Client | *(action-gated)* | Excel/CSV bulk user import |
| `/api/auth/[...nextauth]` | Route handler | Public | Auth.js `GET`/`POST` handlers |
| `/api/download?url=<url>` | Route handler | *None* | Forces attachment download of a remote file |

---

## 4. Feature: Policy Portal (Home)

**Server:** [app/page.tsx](app/page.tsx) → **Client:** [components/HomePage.tsx](components/HomePage.tsx)

The server component authenticates, loads *all* categories and *all* policies from Mongo, serializes them, and hands them to a client component that does filtering entirely in the browser.

### 4.1 Navbar — [components/Navbar.tsx](components/Navbar.tsx)

Sticky pill-shaped header with a graduation-cap logo mark, the "EduPolicy Portal" wordmark, an **Admin Panel** link (`/admin/policy`), and a **Sign Out** button (`/signout`).

### 4.2 Hero + search — [components/HeroSection.tsx](components/HeroSection.tsx)

- Large display heading ("Student Policy Portal") with a supporting subtitle.
- **Decorative 3D tile clusters** flank the heading on `lg+` screens — two absolutely-positioned grids of gradient/neon tiles carrying Lucide icons (graduation cap, sparkles, file, calendar, shield) plus inline SVG target glyphs. Hidden below `lg` and marked `pointer-events-none select-none`.
- **Search box**: a controlled input bound to `searchQuery` state, with a Search button that smooth-scrolls to the `#directory` anchor rather than submitting.
- **Popular search chips**: one-click presets — `UFM 2024`, `Attendance Rules`, `Exam Timetable`, `Hostel Regulations` — that set the query directly.

### 4.3 Quick Access grid — [components/QuickAccessGrid.tsx](components/QuickAccessGrid.tsx)

Renders the **first four** categories (`categories.slice(0, 4)`) as large tiles.

- **Rotating theme palette** (`COLOR_SCHEMES`, cycled by index): neon green, near-black, amber yellow, and warm off-white. Each theme controls background, active ring, border, decorative blur circle position, icon chip background, icon colour, title colour, and body colour.
- **Icon resolution** cascades: the category's stored `icon` name → the category's `name` interpreted as an icon name → a positional default (`GraduationCap`, `Calendar`, `FileText`, `ShieldCheck`).
- Clicking a tile sets the active category filter. The **active tile** gets a coloured ring and a `scale-[1.02]` lift; inactive tiles lift slightly on hover.
- A **"Show All Categories"** link appears whenever the filter is not `"All"`.
- *Special case:* any category whose name contains "academic" routes to `/academic/ufm` instead of filtering.

### 4.4 Policy directory

- Section header "Recently Updated" with a live counter badge: *Showing **N** of **M** policies*.
- **Client-side filtering** combines two predicates:
  - **Search** — case-insensitive substring match against `title` **or** `description`.
  - **Category** — matches `policy.category.name` when the category is a populated object, or compares the raw value when it is a plain string.
- Each result renders as a [PolicyCard](components/PolicyCard.tsx):
  - A **colour-coded category badge** — dedicated `academic` (blue), `campus` (emerald), `exams` (amber), and `attendance` (purple) variants, falling back to `secondary` grey.
  - Last-updated date, formatted as `MMM D, YYYY` (falls back to "Recently").
  - Title, description, and a **View Details** button that navigates to `/policy?id=<_id>`.
  - Group-hover choreography: the border darkens, shadow grows, the title deepens, and the button flips to dark with an arrow that slides right.

### 4.5 Empty states — [components/EmptyState.tsx](components/EmptyState.tsx)

Two distinct states, chosen by whether the database itself is empty:

| Condition | State |
| --- | --- |
| `policies.length === 0` | **"No Policies Published Yet"** — explains the catalogue is empty and offers a *Go to Admin Upload* button linking to `/admin/policy`. |
| Filters exclude everything | **"No Matching Policies Found"** — offers a *Reset All Filters* button that clears both the search query and the category filter. |

---

## 5. Feature: Policy Detail Page

**Server:** [app/policy/page.tsx](app/policy/page.tsx) → **Client:** [app/policy/policyClient.tsx](app/policy/policyClient.tsx)

### 5.1 Data loading

Reads `?id=` from `searchParams` and runs a MongoDB **aggregation pipeline**: `$match` on `_id` → `$lookup` joining the `category` collection → `$unwind` with `preserveNullAndEmptyArrays: true`. The result is normalized into a fully-defaulted `IPolicy` — including a fallback `"General"` category (`file-text` icon, `blue`) when the join finds nothing, legacy `file_link` support for `pdfUrl`, and ISO-string dates. `revalidate = 0` keeps the page always fresh.

### 5.2 Layout

A 12-column grid: an 8-column main panel and a 4-column sidebar, collapsing to a single column below `lg`.

**Sticky header**
- Back link — renders *"Back to Directory"* (a button calling `onBack`) when used as a nested view, or *"Back to Home"* (a link to `/`) when standalone.
- Breadcrumbs — `Home › Policies › <truncated title>`, hidden on small screens.
- **Share Policy** button — copies `window.location.href` via the Clipboard API and swaps to a green *"Link Copied"* check state for 2 seconds.

**Main panel**
- Status row: category badge, a pulsing green **"Active Policy"** pill, and a monospace **document reference** badge. The ref is derived as `DOC-` + the last characters of the ObjectId (`_id.substring(18).toUpperCase()`), falling back to `ACAD-REG`.
- Large policy title.
- Metadata bar with **Effective Date** and **Last Updated** (locale-formatted).
- **Description & Summary** block, rendered `whitespace-pre-line` so authored line breaks survive.
- **Full Content & Clauses** block — only rendered when `fullContent` exists.
- **Download Official PDF** button.
- **Document Live Viewer** — an iframe preview of the attached document, or a dashed-border "No Document Link Attached" placeholder.

**Sidebar**
- *Policy Metadata* card: Category, Status ("Officially Ratified"), Target Audience.
- *Policy Contact & Help* card: owning office, description, a `mailto:` address, and a pre-subjected "Contact Academic Dean" mail button.

### 5.3 Smart document preview (`getPreviewUrl`)

Rewrites share links into embeddable preview URLs before they hit the iframe:

| Input | Transformation |
| --- | --- |
| `drive.google.com/file/d/<ID>/view` | → `https://drive.google.com/file/d/<ID>/preview` (ID extracted by regex) |
| Other Drive URLs | Strips a trailing `/view` (and its query string) and appends `/preview` |
| `docs.google.com/.../d/<ID>/...` | Detects `document` / `spreadsheets` / `presentation` and rebuilds as `https://docs.google.com/<type>/d/<ID>/preview` |
| Anything else (e.g. an S3 URL) | Passed through unchanged |

### 5.4 Not-found state

When no policy resolves, the page renders a self-contained "Policy Not Found" screen with its own header, an icon tile, an explanation, and a *Return Home* button — rather than throwing a 404.

---

## 6. Feature: Admin Policy Management

**Page:** [app/admin/policy/page.tsx](app/admin/policy/page.tsx) · **Manager:** [components/policyAdminManager.tsx](components/policyAdminManager.tsx) · **List:** [components/policyTable.tsx](components/policyTable.tsx)

Admin-gated (`redirect("/signin")` for non-admins). Loads the category list for the dropdown and runs a `$lookup` + `$unwind` aggregation so every policy arrives with its category populated. The header shows the signed-in admin's email in a monospace badge.

### 6.1 Dual-mode create/edit form

A single form serves both create and edit. `editingPolicy` state drives everything:

- **Heading** toggles between *"Create New Policy"* and *"Edit Policy"*.
- **Submit button** toggles between *Add Policy* (plus icon) and *Save Changes* (save icon), dispatching to `addPolicy` or `updatePolicy` accordingly.
- A **`key`** bound to the editing policy's id (or `"create"`) forces React to remount the form, so `defaultValue` prefills actually refresh when you switch rows.
- A hidden `_id` input is injected in edit mode.
- A **Cancel Edit** button appears only while editing.

**Fields**

| Field | Name | Required | Notes |
| --- | --- | --- | --- |
| Policy Title | `title` | ✔ | e.g. "Unfair Means (UFM) Policy 2024" |
| Upload Policy PDF File | `pdfFile` | — | `accept=".pdf"`, styled file input |
| *(OR divider)* | | | Visual separator between the two document sources |
| Policy PDF URL | `pdfUrl` | — | Google Drive or any web link |
| Category | `categoryId` | ✔ | `<select>` populated from the `category` collection |
| Brief Description | `description` | ✔ | 3-row textarea |
| Full Content / Regulatory Framework | `fullContent` | ✔ | 5-row textarea |

**Two-tier 10 MB file limit** — the client action wrapper checks `pdfFile.size` and `alert()`s before dispatching, and `addPolicy`/`updatePolicy` re-check server-side and throw. The client check is a courtesy; the server check is the real gate.

`getCategoryId()` normalizes the category reference for the `defaultValue` — handling a raw string id, a populated object with `_id`, or nothing at all.

### 6.2 Policies directory list

`PolicyTable` renders a card list (not a `<table>`), with a header count and a dedicated empty state ("No policies uploaded yet" + a pointer to the form).

Per row:
- **Heuristic category badge colouring** by name substring — `academic`/`ufm` → blue, `leave`/`attendance` → orange, `exam` → amber, everything else → grey.
- Date via `date-fns` `format(..., "dd MMM, yyyy")`, preferring `updatedAt` then `createdAt`, wrapped in try/catch with a "Recently" fallback.
- Title (with legacy `name` fallback), and a `line-clamp-2` description.
- **Actions**: open the PDF in a new tab (`ExternalLink`, only when a link exists), **Edit** (loads the row into the form), and **Delete**.
- **Delete** is guarded by a `confirm()` dialog, then calls `deletePolicy`; failures are caught, logged, and surfaced via `alert()`.

`isAdmin` is a prop, so the same component can render a read-only list elsewhere.

---

## 7. Feature: Category Management

**Page:** [app/admin/category/page.tsx](app/admin/category/page.tsx) · **Form:** [app/admin/category/categoryForm.tsx](app/admin/category/categoryForm.tsx)

Admin-gated. Creates the taxonomy that drives the Quick Access tiles and policy badges.

| Field | Control |
| --- | --- |
| Category Name | Text input (required) |
| Description | Textarea (required) |
| Icon | **Icon picker** — writes the chosen name to a hidden input; defaults to `ShoppingBag` |
| Color | **`react-colorful` hex picker** — writes the hex to a hidden input; defaults to `#3B82F6` |

### Icon picker — [components/ui/icon-picker.tsx](components/ui/icon-picker.tsx)

- A Radix **Popover** trigger showing the currently selected icon and its name.
- A **curated set of ~58 Lucide icons** (`POPULAR_CATEGORY_ICONS`) rather than the full library — chosen for render performance and a cleaner grid.
- Live **substring search** over icon names, memoized with `useMemo`.
- `IconHelper` resolves an icon name against the statically-imported Lucide module map (no dynamic import waterfall) and falls back to `HelpCircle` for unknown names.
- A separate [components/ui/icons-data.ts](components/ui/icons-data.ts) (~8.7k lines) carries the full icon metadata catalogue — name, categories, and search tags.
- [components/DynamicIcon.tsx](components/DynamicIcon.tsx) is a minimal standalone resolver that renders any Lucide icon by name at a given size, returning `null` when unknown.

---

## 8. Feature: Bulk User Import (Excel/CSV)

**Page:** [app/admin/upload/page.tsx](app/admin/upload/page.tsx) · **Action:** [app/actions/UploadUsers.ts](app/actions/UploadUsers.ts)

Because sign-in is invite-only, this is the primary way accounts get provisioned.

### 8.1 Upload UI

- **Drag-and-drop zone** with three visual states — idle (grey, dashed), drag-over (blue tint), and file-selected (emerald tint). Clicking anywhere in the zone triggers the hidden file input via a ref.
- **Extension validation on drop** — only `.xlsx`, `.xls`, `.csv` are accepted; anything else sets an inline error. (The input's `accept` attribute enforces the same set for click-to-browse.)
- **Selected-file chip** showing a spreadsheet icon, the filename (truncated), a **human-readable size** (`formatFileSize` converts bytes → Bytes/KB/MB with 2 decimals), and an **X** button that clears both the state and the underlying input's `value`.
- **Spreadsheet Layout Specifications** callout documenting the expected columns.
- **Result panels** — a green success panel (with the created/skipped summary) or a red error panel.
- **Submit button** is disabled until a file is chosen and shows an animated spinner with *"Processing Spreadsheet..."* while the action runs. On success the file selection is cleared.

### 8.2 Import pipeline

1. **Authorize** — returns `{ success: false, error: "Unauthorized access" }` unless the session role is `admin`.
2. **Ensure a unique index** on `users.email` (`createIndex({ email: 1 }, { unique: true })`) before any writes.
3. **Parse** the uploaded buffer with `xlsx` and convert **the first sheet** to JSON rows.
4. **Per row:**
   - Accept **either capitalization** of each column (`Email`/`email`, `Name`/`name`, `Password`/`password`) — see `ExcelUserRow` in [types/excel.ts](types/excel.ts).
   - Email is trimmed and lower-cased; a **missing email skips the row**.
   - An **existing email skips the row** (idempotent re-imports).
   - Name defaults to `"User"`.
   - Password is **bcrypt-hashed with 10 salt rounds**; when no password column is present the field is stored as `null` — the account then exists for Google/magic-link sign-in only, since credentials `authorize()` rejects users without a hash.
   - Role is hard-coded to `"user"` — **this importer cannot create admins.**
   - `createdAt` / `updatedAt` timestamps are stamped.
5. **Report** — `Successfully created N users. Skipped M existing or invalid rows.`
6. **Errors** are normalized to an `Error` instance and returned as `{ success: false, error }` — the action never throws into the client.

The discriminated union `ActionResponse<T>` (`{ success: true, message, data? } | { success: false, error }`) makes the result exhaustively checkable at the call site.

---

## 9. Feature: Dynamic Forms Engine

A schema-driven form runtime — form definitions live as documents in the `form` collection and render without any per-form code.

**Page:** [app/forms/[id]/page.tsx](app/forms/[id]/page.tsx) · **Renderer:** [components/forms/FormRenderer.tsx](components/forms/FormRenderer.tsx) · **Validation:** [lib/form-validation.ts](lib/form-validation.ts) · **Action:** [app/actions/SubmitResponse.ts](app/actions/SubmitResponse.ts)

### 9.1 Question types

Declared in [types/form.ts](types/form.ts):

`SHORT_ANSWER` · `PARAGRAPH` · `MULTIPLE_CHOICE` · `CHECKBOXES` · `DROPDOWN` · `DATE`

Each `IQuestion` carries `id`, `type`, `title`, optional `description`, a `required` flag, and optional `choices` (`{ id, label }[]`).

### 9.2 Component registry — [components/forms/questions/registry.ts](components/forms/questions/registry.ts)

A `Partial<Record<QuestionType, ComponentType<QuestionProps>>>` map plus a `getQuestionComponent()` lookup that returns `null` for unregistered types; the renderer then skips that question rather than crashing. Adding a type means writing one component conforming to the `QuestionProps` contract (`question`, `value`, `invalid`, `onChange`) and adding one map entry.

> **Currently implemented:** `SHORT_ANSWER` only ([ShortAnswerQuestion.tsx](components/forms/questions/ShortAnswerQuestion.tsx)). The other five types are typed and validated but have no renderer yet.

### 9.3 Loading & gating

`ObjectId.isValid(id)` is checked before the query; an invalid id or a missing document calls `notFound()`. The raw document is normalized with defaults (`"Untitled form"`, empty description, `acceptingResponses ?? true`, coerced `required`, ISO dates). When `acceptingResponses` is false, the page short-circuits to a **"This form is no longer accepting responses."** notice instead of rendering fields.

### 9.4 Validation — dual-layer

Shared helpers in `lib/form-validation.ts` run on **both** client and server:

- `emptyAnswerFor(question)` — `[]` for `CHECKBOXES`, `""` otherwise.
- `isBlank(value)` — `null`/`undefined`, an empty array, or a whitespace-only string.
- `validateQuestion` / `validateAnswers` — produce a `FormErrors` map keyed by question id, with the message `"This is a required question"`.

Because the same module is imported on both sides, client and server can never disagree about what counts as blank.

### 9.5 Submission flow

Built on React 19's `useActionState`:

1. `onSubmit` runs **client validation first**. If errors exist it calls `preventDefault()`, so the network request never fires.
2. On failure the renderer **scrolls the first invalid question into view** (`data-question-id` + `CSS.escape`, `behavior: "smooth"`, `block: "center"`) and **focuses its input** (`[name="..."]`).
3. `noValidate` disables native browser validation so the custom messaging is the only messaging.
4. **Error clearing**: a `cleared[]` list tracks fields the user has edited since the last submit; those are filtered out of the merged `{...serverErrors, ...clientErrors}` map, so an error disappears the moment you start fixing it.
5. **Server re-validation** in `submitResponse` repeats every check — id validity, form existence, `acceptingResponses`, and required fields — and returns typed `SubmitState` (`idle` | `error` | `success`).
6. `CHECKBOXES` answers are read with `formData.getAll()`; every other type uses `formData.get()` and is trimmed.
7. On success, the response is inserted into `formResponse` with the form ref, the answers map, `submittedAt`, and — **if a session exists** — the `respondentEmail`. Anonymous submissions are allowed.
8. A **success screen** replaces the form and offers **"Submit another response"**, which bumps an `attempt` counter used as the `key` on `FormFill` — remounting it for a completely clean slate.

### 9.6 Accessibility

`QuestionCard` ([components/forms/QuestionCard.tsx](components/forms/QuestionCard.tsx)) wires up `<label htmlFor>`, a red `*` marked `aria-hidden` for required questions, and an error paragraph with `role="alert"` and a stable `${question.id}-error` id. Inputs set `aria-invalid`, `aria-required`, and `aria-describedby` pointing at that error node, plus a red border while invalid. A `* Indicates required question` legend renders in the header only when at least one question is required.

---

## 10. Feature: File Storage & Download Proxy

### 10.1 S3 upload — [lib/s3.ts](lib/s3.ts)

`uploadToS3(file)` reads the `File` into a Buffer, builds the key `policies/<timestamp>-<filename-with-spaces-hyphenated>`, sends a `PutObjectCommand` with the detected content type (defaulting to `application/pdf`), and returns the public URL `https://<bucket>.s3.<region>.amazonaws.com/<key>`. The region defaults to `us-east-1`.

The module is **dynamically imported** (`await import("@/lib/s3")`) inside the policy actions, so the AWS SDK is only pulled in when a file is actually uploaded.

### 10.2 Download proxy — [app/api/download/route.ts](app/api/download/route.ts)

`GET /api/download?url=<encoded>` fetches the remote file server-side and re-streams it with `Content-Disposition: attachment`, deriving the filename from the last URL segment (falling back to `policy.pdf`) and forwarding the upstream `Content-Type` (falling back to `application/octet-stream`).

This exists because S3 and Google Drive links open in-browser rather than downloading; the proxy forces a real save-to-disk. Missing `url` → `400`; upstream failure → `500` with the error message.

The policy page's download handler passes `encodeURIComponent(pdfUrl)` and alerts when a policy has no attached file.

---

## 11. Data Model

Mongoose schemas are declared in [models/](models/), but runtime reads and writes use the native driver against these collection names:

| Collection | Written by | Notes |
| --- | --- | --- |
| `users` | `UploadUsers` action, Auth.js adapter | Unique index on `email` |
| `category` | `AddCategory` action | Singular name — **not** the Mongoose-default `categories` |
| `policy` | `AddPolicy` / `UpdatePolicy` / `DeletePolicy` | Singular name |
| `form` | *(seeded externally)* | No admin UI yet |
| `formResponse` | `SubmitResponse` action | |
| *(Auth.js collections)* | `@auth/mongodb-adapter` | accounts, sessions, verification tokens |

### User — [models/User.ts](models/User.ts) / [types/user.ts](types/user.ts)

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | required |
| `email` | string | required, **unique** |
| `password` | string \| null | optional — bcrypt hash; null means OAuth/magic-link only |
| `role` | `"user" \| "admin"` | defaults to `user` |
| `createdAt` / `updatedAt` | Date | schema `timestamps: true` |

### Category — [models/Category.ts](models/Category.ts) / [types/category.ts](types/category.ts)

| Field | Type | Notes |
| --- | --- | --- |
| `name` | string | required |
| `description` | string | required |
| `icon` | string | Lucide icon name |
| `color` | string | hex colour |

### Policy — [models/Policy.ts](models/Policy.ts) / [types/policy.ts](types/policy.ts)

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | required |
| `description` | string | required — short summary |
| `pdfUrl` | string | S3 URL or external link (legacy alias `file_link` is read at several call sites) |
| `fullContent` | string | long-form clause text |
| `category` | ObjectId → `Category` | required; joined via `$lookup` |
| `createdAt` / `updatedAt` | Date | set explicitly by the actions |

### Form & FormResponse — [types/form.ts](types/form.ts)

```ts
IForm            { _id, title, description?, questions: IQuestion[],
                   acceptingResponses: boolean, createdAt, updatedAt }
IQuestion        { id, type: QuestionType, title, description?,
                   required: boolean, choices?: IChoice[] }
IChoice          { id, label }
IFormResponse    { _id, form, answers: Record<string, AnswerValue>,
                   respondentEmail?, submittedAt }
AnswerValue      = string | string[]
```

---

## 12. Server Actions Reference

All live in [app/actions/](app/actions/) and are marked `"use server"`.

| Action | Signature | Guard | Behaviour |
| --- | --- | --- | --- |
| `addPolicy` | `(formData) => Promise<void>` | admin | Validates category presence, enforces the 10 MB limit, uploads to S3 when a file is present (otherwise keeps the URL), inserts with timestamps, revalidates `/admin/policy` + `/policy`. |
| `updatePolicy` | `(formData) => Promise<void>` | admin | Same as above plus an `_id` requirement; `$set`s all fields and refreshes `updatedAt`. Accepts legacy `name` and `file_link` field names as fallbacks. Revalidates both paths. |
| `deletePolicy` | `(id: string \| ObjectId \| undefined) => Promise<void>` | admin | Normalizes the id to a string, `deleteOne`, revalidates both paths. |
| `addCategory` | `(formData) => Promise<void>` | admin | Requires **all four** fields (name, description, icon, color), inserts, revalidates `/policy`. |
| `uploadUsersFromExcel` | `(formData) => Promise<ActionResponse<ImportSummary>>` | admin | See [§8](#8-feature-bulk-user-import-excelcsv). Returns a result object instead of throwing. |
| `submitResponse` | `(formId, prevState, formData) => Promise<SubmitState>` | *(public)* | See [§9](#9-feature-dynamic-forms-engine). Bound with `.bind(null, formId)` for `useActionState`. |

**Error convention:** policy/category actions **throw** (`"Unauthorized access"`, `"All fields are required"`, `"Category is required"`, `"Policy ID is required"`, `"File size exceeds the 10MB limit."`); the form and import actions **return typed result objects** so their UIs can render errors inline.

---

## 13. API Routes Reference

| Route | Methods | Description |
| --- | --- | --- |
| `/api/auth/[...nextauth]` | `GET`, `POST` | Re-exports Auth.js `handlers` — sign-in, callbacks, session, CSRF, sign-out. |
| `/api/download` | `GET` | `?url=` proxy that forces an attachment download. `400` on a missing param, `500` on upstream failure. |

---

## 14. Design System & UI Components

### Visual language

A warm, editorial palette rather than default shadcn greys:

| Token | Value | Use |
| --- | --- | --- |
| Page background | `#FAF9F6` | Detail/admin pages |
| Surface / chip | `#F4F2EC` | Navbar, badges, soft buttons |
| Border | `#E6E2D8` | Cards, dividers |
| Ink | `#0d0e12` | Primary text |
| Muted ink | `#505258` | Body copy |
| Dark action | `#121316` | Primary buttons |
| Accent blue | `#0056cc` | Admin CTAs |
| Accent green | `#00e685` | Highlight tiles, active states |
| Accent amber | `#ffc500` | Highlight tiles |

Typography is **Geist Sans + Geist Mono** loaded via `next/font/google` in [app/layout.tsx](app/layout.tsx) and exposed as `--font-geist-sans` / `--font-geist-mono`.

[app/globals.css](app/globals.css) imports Tailwind v4, `tw-animate-css`, and `shadcn/tailwind.css`, defines a `dark` custom variant, and maps a full **OKLCH** token set (background, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, five chart colours, and a sidebar group) plus a calculated radius scale from `--radius-sm` through `--radius-4xl`.

### Component inventory

| Component | Purpose |
| --- | --- |
| [button.tsx](components/ui/button.tsx) | CVA variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, plus custom **`dark`** and **`soft`**. Sizes: `default`, `sm`, `lg`, `icon`. |
| [badge.tsx](components/ui/badge.tsx) | Variants `default`, `secondary`, `destructive`, `outline` (monospace), plus **category variants** `academic`, `campus`, `exams`, `attendance`. |
| [card.tsx](components/ui/card.tsx) | Card shell with header/title/description/content/footer parts. |
| [dialog.tsx](components/ui/dialog.tsx) | Radix Dialog wrapper with overlay, close button, header/title. |
| [popover.tsx](components/ui/popover.tsx) | Radix Popover — powers the icon picker. |
| [input.tsx](components/ui/input.tsx) | Styled text input. |
| [avatar.tsx](components/ui/avatar.tsx), [tooltip.tsx](components/ui/tooltip.tsx), [skeleton.tsx](components/ui/skeleton.tsx) | Radix/utility primitives. |
| [icon-picker.tsx](components/ui/icon-picker.tsx) | Searchable curated Lucide picker (see [§7](#7-feature-category-management)). |
| [icons-data.ts](components/ui/icons-data.ts) | Full Lucide metadata catalogue (name, categories, tags). |

shadcn is configured in [components.json](components.json): style `radix-nova`, RSC enabled, TSX, base colour `neutral`, CSS variables on, Lucide icons, with `@/components`, `@/lib`, `@/components/ui` aliases.

### Responsive behaviour

Mobile-first throughout: the sign-in page stacks its hero above the form; the detail page collapses 8/4 to a single column; the admin console collapses 5/7; the Quick Access grid goes 1 → 2 → 4 columns; policy cards switch from row to column; breadcrumbs and the decorative hero tiles are hidden on small screens.

---

## 15. Configuration & Environment

| Variable | Required | Used by | Purpose |
| --- | --- | --- | --- |
| `MONGODB_URI` | **Yes** | [lib/db.ts](lib/db.ts) | Connection string. The module **throws at import time** if unset. |
| `AUTH_SECRET` | **Yes** | [auth.ts](auth.ts) | JWT/session signing secret. |
| `BETTER_AUTH_SECRET` | No | [auth.ts](auth.ts) | Fallback used when `AUTH_SECRET` is absent. |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | For Google | Auth.js | Read implicitly by the Google provider. |
| `AUTH_RESEND_KEY` | For magic links | [auth.ts](auth.ts) | Resend API key. |
| `EMAIL_FROM` | No | [auth.ts](auth.ts) | Magic-link sender; defaults to `onboarding@resend.dev`. |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | For uploads | [lib/s3.ts](lib/s3.ts) | S3 credentials (default to empty strings). |
| `AWS_REGION` | No | [lib/s3.ts](lib/s3.ts) | Defaults to `us-east-1`. |
| `AWS_S3_BUCKET_NAME` | For uploads | [lib/s3.ts](lib/s3.ts) | Target bucket (defaults to an empty string). |

The MongoDB client is configured with **Stable API v1** (`strict: true`, `deprecationErrors: true`).

### Scripts

```bash
npm run dev     # next dev
npm run build   # next build
npm run start   # next start
npm run lint    # eslint
```

---

## 16. Build & Deployment

### Docker — [Dockerfile](Dockerfile)

A three-stage build on `node:20-alpine`:

1. **deps** — installs `libc6-compat`, copies the lockfile, runs `npm ci`.
2. **builder** — copies the source, disables telemetry, injects **dummy** `MONGODB_URI` and `AUTH_SECRET` values (so the build-time `lib/db.ts` guard doesn't abort the build), and runs `npm run build`.
3. **runner** — creates a non-root `nextjs:nodejs` user (uid/gid 1001), copies `public/`, the traced `standalone` output, and `.next/static`, pre-creates `.next` with correct ownership for the prerender cache, exposes `3000`, sets `HOSTNAME=0.0.0.0`, and starts `node server.js`.

Real secrets are supplied at **runtime**, not baked into the image.

### CI — [.github/workflows/docker-publish.yml](.github/workflows/docker-publish.yml)

On every push to `main` or `master`: log in to **GHCR** with the built-in `GITHUB_TOKEN`, derive tags with `docker/metadata-action` (`latest` plus a short-SHA tag), set up Buildx, then build and push with **GitHub Actions layer caching** (`cache-from`/`cache-to: type=gha, mode=max`). Permissions are scoped to `contents: read` + `packages: write`.

---

## 17. Known Gaps & Inconsistencies

Observed while surveying the code — recorded here so they aren't mistaken for features.

**Configuration**
1. **`.env.example` names the wrong DB variable.** It lists `DATABASE_URI`, but [lib/db.ts](lib/db.ts) requires `MONGODB_URI` and throws without it. It also omits every Google and AWS variable.

**Security**
2. **`/api/download` is an unauthenticated open proxy.** It fetches any URL passed in `?url=` with no allowlist and no session check — usable to reach internal network addresses (SSRF) or to launder arbitrary traffic through the server.
3. **`/forms/[id]` has no auth check.** Any visitor with a form id can view and submit; `respondentEmail` is recorded only when a session happens to exist.
4. **[proxy.ts](proxy.ts) exports no `config.matcher`,** so the Auth.js proxy runs on every matched request rather than a scoped set of paths.

**Incomplete features**
5. **Five of six question types have no renderer.** `PARAGRAPH`, `MULTIPLE_CHOICE`, `CHECKBOXES`, `DROPDOWN`, and `DATE` are typed and validated but skipped at render time by `getQuestionComponent`.
6. **No admin UI for forms.** `form` documents must be inserted into MongoDB by hand; there is no builder, no response viewer, and no way to toggle `acceptingResponses` from the app.
7. **Category management is create-only** — no listing, editing, or deletion, and the `color` field is captured but never used for styling (the Quick Access tiles use their own rotating palette instead).
8. **`QuickAccessGrid` links "academic" categories to `/academic/ufm`,** a route that does not exist in the app.
9. **Only the first four categories are reachable** from the home page (`categories.slice(0, 4)`), with no "view all" path.

**Dead / unreachable code**
10. **`PolicyDetailModal` never opens.** `HomePage` renders it bound to `selectedPolicy`, but `PolicyCard`'s `onSelect` navigates via the router instead of setting that state, so `selectedPolicy` stays `null`. Its download button is also a placeholder `alert()`.
11. **`FilterSidebar` is not imported anywhere,** and its options are hard-coded (`Undergraduate`, `Postgraduate`, `Academic`, `Exams`, …) rather than derived from the database.
12. **`components/sign-in.tsx`** is a bare Google sign-in button superseded by `LoginForm`.
13. **A stray `console.log("cad", categories)`** remains in `QuickAccessGrid`.

**Data-layer drift**
14. **Mongoose models are declared but never used at runtime.** All access goes through the native driver, and the collection names (`category`, `policy`) are singular — they would **not** match the plural names Mongoose would infer if the models were ever activated.
15. **Legacy field names are handled ad hoc.** `file_link` → `pdfUrl` and `name` → `title` fallbacks are scattered across the policy page, table, and update action, typed away with `as any`.
16. **Hard-coded placeholder content on the policy detail page** — the effective date (`"August 1, 2024"`), audience (`"Students & Academic Faculty"`), status (`"Officially Ratified"`), and the entire contact card (`integrity@university.edu`, `dean.academic@university.edu`) are literals, not data fields.

**Polish**
17. **Root metadata is still the scaffold default** — `title: "Create Next App"` in [app/layout.tsx](app/layout.tsx).
18. **[README.md](README.md) is the unmodified `create-next-app` template.**
19. **`/signout` is unstyled** relative to the rest of the app, and **`/admin/category`** renders a bare form with no page chrome.
