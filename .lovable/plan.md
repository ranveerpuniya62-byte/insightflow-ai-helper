
# AI Study Chat — Web App Plan

Building a production-quality **web** version (TanStack Start + React + Lovable Cloud + Lovable AI Gateway). Not Flutter — same features, delivered as a responsive PWA-friendly web app.

## Scope for v1 (this build)

### Auth
- Email + password + Google sign-in (Lovable Cloud)
- Welcome, Login, Register, Forgot Password, Reset Password
- Persistent session, protected `/app/*` routes
- `profiles` table + `user_roles` table (admin/user)

### Dashboard (`/app`)
- Greeting + user name
- Live credit counters: AI Chat, Homework, Image credits (shared analysis+generation)
- 24h reset countdown
- Animated feature cards: Chat, Homework, Image Analysis, Image Generator, History, Profile, Settings

### AI Chat (`/app/chat`, `/app/chat/$threadId`)
- Streaming via `useChat` → `/api/chat` (Lovable AI, `google/gemini-3-flash-preview` default for multimodal)
- Markdown + KaTeX math rendering, code blocks
- Copy / regenerate / delete / continue thread
- Image upload (camera/gallery via file input)
- 3–5 "You may also ask" suggestions after each answer
- Threads persisted in `chat_threads` / `chat_messages`

### Homework Helper (`/app/homework`)
- Subject picker (Math, Science, English, History, GK)
- Text prompt + optional image upload (OCR handled by Gemini vision)
- Step-by-step focused answer, exam-oriented system prompt

### Image Analysis (`/app/analyze`)
- Upload image → instant Gemini vision analysis
- Copy / share / history

### Image Generator (`/app/generate`)
- Prompt, style, aspect ratio, quality
- Streaming via `/api/generate-image` (`google/gemini-3-pro-image`)
- Preview with progressive blur → final; download PNG; regenerate; history

### Credits system
- `user_credits` table: `chats_remaining`, `homework_remaining`, `image_credits_remaining`, `reset_at`
- Server-side deduction **only after success**
- Auto-reset on read if `now > reset_at`
- Limits: Chat 10/day, Homework 10/day, Images 5/day (shared analysis+generation)
- Friendly limit-reached dialog

### History (`/app/history`)
- Unified view across chat, homework, analysis, generation
- Search, rename, delete, resume

### Profile & Settings (`/app/profile`, `/app/settings`)
- Name, email, avatar, credits summary, sign out
- Theme toggle (light/dark/system)

### Legal & marketing
- Landing page (hero, features, CTA)
- About, Contact (name/email/subject/message → stored in `contact_messages`), Privacy, Terms, Cookie Policy, FAQ, Help Center
- Footer with all legal links (no Refund Policy)

## Design
- Dark-first premium UI, glassmorphism cards, gradient accents, soft shadows
- Semantic tokens in `src/styles.css` (OKLCH), custom shadcn variants (`hero`, `glass`, `premium`)
- Framer Motion for card + page transitions
- Responsive, mobile-first
- Rendering: `react-markdown` + `remark-math` + `rehype-katex` for chat/homework/analysis

## Technical

**Stack**
- TanStack Start (already scaffolded), Lovable Cloud (Supabase-backed), Lovable AI Gateway
- Server routes: `/api/chat` (streaming), `/api/generate-image` (streaming SSE passthrough)
- Server functions (`createServerFn`): `analyzeImage`, `homeworkAnswer`, `deductCredit`, `getCredits`, thread CRUD, history CRUD

**Database (public schema, RLS + GRANTs)**
- `profiles(id, full_name, avatar_url, created_at)`
- `user_roles(user_id, role app_role)` + `has_role()` SECURITY DEFINER
- `user_credits(user_id, chats_remaining, homework_remaining, image_credits_remaining, reset_at)`
- `chat_threads(id, user_id, title, created_at, updated_at)`
- `chat_messages(id, thread_id, role, parts jsonb, created_at)`
- `history_items(id, user_id, kind, title, payload jsonb, created_at)` (homework/analysis/generation)
- `contact_messages(id, name, email, subject, message, created_at)`
- Trigger to auto-create profile + credits row on signup

**Security**
- RLS everywhere; users see only their own rows
- Server-side credit checks before every AI call
- Input validation with Zod
- File uploads validated (mime + size ≤ 10MB) and sent as base64 to Gemini (no storage bucket needed for v1)
- No secrets in client; `LOVABLE_API_KEY` server-only

## Out of scope for v1 (call out explicitly)
- Voice input (Web Speech API can be added later)
- Real-time streaming for homework/analysis (they'll use one-shot generation with a loading state)
- Admin dashboard UI (roles table exists; UI not built)
- Email verification enforcement (Lovable Cloud handles verification email; app won't gate on it in v1)
- Push notifications, PWA install prompt

## Build order
1. Design system + landing + legal pages + footer
2. Enable Lovable Cloud, DB schema, auth (email + Google), protected layout
3. Credits system + dashboard
4. AI Chat (streaming, threads, markdown+math, suggestions)
5. Homework Helper
6. Image Analysis
7. Image Generator (streaming)
8. History (unified)
9. Profile / Settings / polish pass

Approve and I'll start with steps 1–3 in the first batch, then continue through the rest.
