# ACAG — confirmed facts

Append-only. Every line carries a source. Nothing here is inferred or assumed.
`[UNCONFIRMED]` means Joseph has not yet confirmed it and it must not be posted.

## What it is

- AI booking assistant for independent hair stylists. Client sends a screenshot of
  a style from Instagram/TikTok (or describes it); the assistant matches it to the
  stylist's portfolio, asks the questions that style needs (length in inches, braid
  size, hair included), quotes a price, haggles within a private limit, offers free
  times, and books the slot only once a 30% deposit or full payment clears through
  PayPal. — *source: README.md*
- Built for the PayPal AI Hackathon (Devpost). — *source: Joseph's brief*
- Live: https://acag-idop.onrender.com — client chat at `/s/crown-and-coil`,
  stylist dashboard at `/dashboard`. — *source: README.md, verified live 2026-11-27*
- Stack: Next.js 16 App Router, Vercel AI SDK with Gemini, Supabase Postgres +
  Storage via Drizzle, PayPal Orders v2 (Sandbox), Tailwind v4, Vitest, hosted on
  Render. — *source: README.md*

## Timeline (real dates, from git)

- 5 commits total, 2026-11-02 → 2026-11-06. — *source: `git rev-list --count HEAD`*
- **2026-11-02**: four commits in one day.
  - "Add foundation: design tokens, pricing, negotiation, PayPal client, schema"
    — 32 files, +10,953
  - "Add buyer chat, PayPal checkout, seller dashboard and demo hub"
    — 56 files, +2,993 / -78
  - "Keep the assistant answering when a free model quota runs out"
    — 12 files, +161 / -12
  - "Redesign hub, dashboard, chat and payment result for clearer flows"
    — 35 files, +1,180 / -479
  - **~15,000 lines inserted in one day.** — *source: `git log --shortstat`*
- **2026-11-06**: "Niche Acag to hair stylists: style matching, length pricing and
  paid bookings" — 99 files, +3,260 / -1,684. The pivot.
  — *source: `git log --shortstat`*

## The pivot

- The project started broader — an AI sales agent for social-media sellers
  (Instagram/WhatsApp DMs) that dropped a PayPal checkout link.
  — *source: Joseph's brief*
- On 2026-11-06 it was narrowed to hair stylists specifically, rewriting 99 files.
  — *source: commit "Niche Acag to hair stylists"*
- **Why he pivoted — CONFIRMED by Joseph, 2026-11-27, his words:** "I pivoted
  because I wanted to niche, social seller is general in a sense so I wanted to
  do something way more niche so that would help build more specific features."
- The point worth making from that: narrowing the audience is what *unlocked*
  the specific features. "Sellers" can't have length-in-inches pricing, a style
  portfolio matcher or a per-weekday opening-hours diary. "Hair stylists" can.
  The niche didn't shrink the product, it made it buildable.

## What broke (real, from the diff)

Commit "Keep the assistant answering when a free model quota runs out" (2026-11-02):

- The free Gemini tier hit its rate limit mid-build. The assistant stopped
  answering. — *source: commit subject + the 429 handler added in
  `src/app/api/chat/route.ts`*
- Fixes in that commit:
  - A backup model behind `assistantModel()` in `src/server/ai/model.ts` (new file,
    +43 lines, with `model.test.ts` at +46).
  - A 429-specific message to the client: *"The assistant has hit its free usage
    limit. Wait a minute, then send that again."* instead of a dead chat.
  - `statusOf()` walks `lastError` because **retries wrap the provider error**, so
    the real status code is buried one level down. — *source: the inline comment
    "Retries wrap the provider error, so look through to the last attempt."*
  - A second, subtler bug found in the same pass: a failed turn left an **empty
    assistant message** in the saved conversation, which then became noise in every
    later prompt. Fixed by filtering messages whose only part is `step-start`
    before saving. — *source: the comment "A failed turn leaves an empty assistant
    message, which is noise in later prompts."*

That last one is the best teaching material in the repo: the model failing didn't
just break one reply, it quietly poisoned the context for every reply after it.

## Architecture worth teaching

- **The model never does the maths.** The server computes every price — e.g. $10
  an inch, so 3 inches is $30, 7 inches is $70, plus or minus option prices like
  small braids. — *source: README "How it works" step 2*
- **The model never sees the floor.** Each style has a private maximum discount
  (15% lets $70 come down to $60). The server decides every counter-offer. Lowballs
  are told they're way too low and the price comes down slowly; close offers are
  met; persistent offers get "this is the lowest I can go". The floor never reaches
  the model or the browser. — *source: README step 3*
- **Double-booking is stopped in Postgres, not in the prompt.** Choosing a time
  places a 15-minute hold, and a Postgres advisory lock stops two clients holding
  the same slot. A start time is only offered if the whole appointment fits before
  closing and around existing bookings. — *source: README step 4*
- **Payment is verified server-side.** The booking confirms only after the server
  captures the payment and checks amount, currency and booking id. A verified
  webhook can confirm it too. Unpaid holds expire and never reach the diary.
  — *source: README step 5*
- Image matching: Gemini compares the client's screenshot against two portfolio
  photos per style and returns up to three candidates. Typed descriptions like
  "twists for a guy" are searched by name, description and men's/women's styles.
  — *source: README step 1*
- `src/server/` is split by concern: `ai`, `booking`, `catalogue`, `db`,
  `negotiation`, `payments`, `paypal`, `pricing`, `seller`. — *source: `find src`*

## Honest limits (the stylist's own README says so)

- One disclosed PayPal Sandbox merchant account. Stylists can't connect their own
  PayPal yet; no real money moves.
- The dashboard is a shared demo login. No stylist accounts.
- Refunds for cancellations happen in PayPal, not the app.
- If two clients pay for the same slot after a hold expires, both payments
  confirm. Checkout re-checks the slot before PayPal opens, making it rare but not
  impossible. — *source: README "Honest limits"*

## Demo access

- PayPal Sandbox buyer login is printed on the live landing page:
  `sb-2k3y729796753@personal.example.com`, password on the page. Sandbox only, no
  real money. — *source: live page text, 2026-11-27*
- Keep it in env vars (`ACAG_USER` / `ACAG_PASS`) rather than in shotlist.json,
  even though it's public.
- **[UNCONFIRMED]** whether `/dashboard` needs a separate login. README says
  "shared demo login"; the landing page links straight to it.

## Operational facts

- Render free tier sleeps. Measured cold start on 2026-11-27: **39.5 seconds** to
  first byte. — *source: curl timing*
- Supabase free tier paused the database after ~21 days idle (last commit
  2026-11-06). Every DB-backed route returned HTTP 500 while paused; the static
  landing page still rendered. Joseph resumed it on 2026-11-27 and all routes
  returned 200. — *source: measured directly, 2026-11-27*

## Results

- **He never submitted it. He missed the deadline.** CONFIRMED by Joseph
  2026-11-27, his words: *"Didn't meet the submission deadline. More like I
  thought the submission date was 15th but it turns out it was 12th and I only
  found this out on 16th 😅😂"*
- So: the deadline was **12 Nov**. He believed it was the **15th**. He found out
  on the **16th**, four days after it had closed. His last commit is **6 Nov** —
  six days before the real deadline, he had a working product and no idea the
  clock had already almost run out.
- **No users. No judging. No placement. No revenue.** Do not imply otherwise,
  ever. The only supportable claims are: he built it, it works, it's live.
- **[PERMISSION PENDING]** Whether the missed-deadline story may be posted
  publicly. Do not use it until he says yes.

## His take — 2026-11-27

**Why the server owns pricing and the model never sees the floor** (he picked
three reasons, all of them):

1. He doesn't trust a language model with money. It shouldn't be the thing
   deciding what a customer pays.
2. **It leaks.** Anything in the prompt or in the browser can be pulled out by
   the customer, and the stylist's lowest acceptable price is exactly the thing
   that must never leak.
3. Cost and reliability — cheaper and more predictable to do arithmetic in code
   than to spend tokens on maths the model does unreliably.

**What annoyed him most:** rewriting 99 files to pivot. The 6 Nov niching commit,
+3,260 / -1,684 — redoing work he had already done.

**Audience this week:** a mix. Threads aimed at founders, quick-value posts
aimed at beginners.

## Still needed from Joseph

1. ~~Why the pivot?~~ ANSWERED 2026-11-27, see "The pivot" above.
2. ~~Hackathon result.~~ ANSWERED 2026-11-27 — missed the deadline, see Results.
   Permission to post that story still pending.
3. The hardest part — what took longest or nearly didn't work?
4. A real detail from this week, for the Saturday post.
7. What he is tired of hearing people say about AI/building.
5. ~~Sample tweets.~~ DONE 2026-11-27 — 7 tweets captured in `voice.md`.
   Confirmed: sentence case, no hashtags ever, 🧵 is the only emoji he uses,
   @JosephBusayo9, 212 followers.
6. His take on the project (the step-3 interview) — not yet run.
