# Destroy The Decibel (DTD) — The Battle of Exhausts

Event website for the car exhaust sound competition organized by the Department of
Computer Science & Engineering, Vidya Academy of Science and Technology, Thrissur.
**17 October 2026 · Thalakkottukara, Thrissur · ₹40,000 prize pool · ₹1,000 entry.**

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · GSAP ScrollTrigger ·
React Hook Form + Zod · Supabase · Razorpay.

## Run it

```bash
npm install
cp .env.example .env.local   # optional: the site runs without any credentials
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` / `npm run typecheck` | ESLint and TypeScript checks |

## Registration

Registration is by phone: `/register` lists the three coordinators with tap-to-call numbers, the
fee and the key conditions. There is no form on the site.

The earlier online flow (form, Supabase storage, Razorpay checkout) is parked, not deleted:
`app/_api/`, `app/register/_status/`, `components/registration/`, `lib/database.ts`,
`lib/payment.ts` and `supabase/schema.sql`. Folders starting with `_` are not routed, so none of it
is reachable. To bring it back, rename `app/_api` → `app/api` and `app/register/_status` →
`app/register/status`, restore the form on `/register`, and follow the notes below.
`npm run test:payments` only works with those routes restored.

### If online registration is restored



The site degrades honestly: it never shows a payment as successful unless Razorpay
confirms it on the server.

| Configured | Behaviour of `/register` |
| --- | --- |
| Nothing | Form validates, then says registration is not activated. Nothing is saved. |
| Supabase only | Details saved as **payment pending** with a reference; user is sent to the coordinators. |
| Supabase + Razorpay | Full checkout, server-side verification, receipt. |

1. **Supabase** — create a project, run [`supabase/schema.sql`](supabase/schema.sql) in the SQL
   editor, then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. RLS is enabled with deny-all
   policies; only the server (service-role key) touches the table.
2. **Razorpay** — set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (use `rzp_test_…` first).
   Keep automatic capture on (Settings → Payment capture); an authorized-but-uncaptured payment
   is deliberately left pending.
3. **Webhook (recommended)** — add `https://<domain>/api/payment/webhook` for
   `payment.captured` and `payment.failed`, and set `RAZORPAY_WEBHOOK_SECRET`. This confirms
   payments even if the buyer closes the tab before returning to the site.
4. Set `NEXT_PUBLIC_SITE_URL` to the deployed origin.

### How a payment is confirmed

`POST /api/register` validates with the shared Zod schema, upserts one row per vehicle number
(unique constraint), and creates **one** Razorpay order that every retry reuses.
`POST /api/payment/verify` marks a row paid only if (1) the HMAC checkout signature is valid,
(2) the order belongs to a stored registration, and (3) Razorpay's API reports that payment as
`captured`, for that order, for the full ₹1,000. The update is idempotent and can never be
undone by a cancel/failure call. No card data ever reaches this server.

Staff read registrations in the Supabase table editor (`status = 'paid'`).

## Content

All event facts, the 26 rules, the timeline, FAQ and coordinators live in
[`lib/event.ts`](lib/event.ts) and come from the official posters. Not yet confirmed by the
organizers, and therefore not on the site: prize split, event start time beyond the published
schedule, sponsors, social links and emails. WhatsApp buttons are built but switched off —
set `whatsappVerified: true` per coordinator once each number is confirmed.

## Images

`public/images/builds/` holds the six official build posters (DTD 006, 007, 009, 011, 012, 017) shown in
`components/sections/Builds.tsx`.

`public/brand/cse-logo.png` is the Department of CSE mark (black background removed, glow kept),
shown in the nav, loader and footer.

`public/brand/dtd-logo.png` is the official wordmark, converted from the supplied black-on-white
artwork to white lettering on transparent (used in the nav, loader and footer via
`components/ui/Logo.tsx`).

`public/video/dtd-film.mp4` is the 18-second trailer, shown first after the hero (edit @fx.arjuuuhh,
camera @rshh.field). The file is a landscape film stored sideways, so `components/ui/VideoPlayer.tsx`
rotates it with CSS and supplies its own controls. It loads only when play is pressed.

`public/audio/soundtrack.mp3` is the site music, played by the floating button
(`components/audio/SoundToggle.tsx`). It autoplays: on load where the browser allows it, otherwise
on the visitor's first tap, click or key press (browsers refuse sound before any interaction).
The button switches it off for the session; it pauses while a video plays and goes silent while the car revs. It is a commercial recording: publishing it
on a public site needs a licence from the rights holders; swap the file for licensed or
royalty-free music (same filename) if you don't have one.

`public/video/guest-reveal.mp4` is the guest announcement shown in `components/sections/Guest.tsx`.
Set `guestName` in `lib/event.ts` to print the guest's name beside it.

`public/video/hero-crowd.mp4` is the looping, always-muted background of the first screen (also a
landscape clip stored sideways, rotated in `components/hero/Hero.tsx`).

3D showcase: `components/sections/Machine.tsx` renders a real-time 3D car with three.js; scrolling
orbits the camera through three stops. **Rev the engine** (and one automatic rev on first arrival)
plays a synthesised exhaust — three blips, a long pull, then pops and bangs — from
`lib/engine-audio.ts`, and a GPU particle fire follows its timing, with a fireball on each backfire. three.js and the model load only as the section approaches.
`public/models/showcase-car.glb` is the sample car from the three.js examples, credited there to
Sketchfab user vicent091036 (its badges are hidden). Its licence could not be verified — confirm it
or replace the file before a public launch. `public/draco/` is the decoder it needs.

## Security

The site is read-only: no forms, no API routes, no accounts, no database connection, no cookies.
- `proxy.ts` refuses every request that is not GET/HEAD/OPTIONS with 405.
- `next.config.ts` sends a strict Content-Security-Policy (same-origin only — the single exception
  is the sandboxed Google map of the venue — no framing of this site, no form submission), HSTS, `X-Frame-Options: DENY`, `nosniff`, a locked-down Permissions-Policy and
  related headers on every response.
- `npm audit --omit=dev` reports 0 known vulnerabilities at the time of writing; re-run it before deploying.

What code cannot cover: protect the hosting, domain-registrar and Git accounts with strong unique
passwords and two-factor authentication, give deploy access to as few people as possible, and keep
dependencies updated. Those accounts are how sites like this are actually defaced.

## Deploying

Vercel: import the repo and add the environment variables. Cloudflare Workers: use the
OpenNext adapter with `nodejs_compat` (the payment code uses `node:crypto`).
The in-memory rate limiter is best-effort on serverless; add platform rate limiting for
`/api/*` if you expect abuse.
