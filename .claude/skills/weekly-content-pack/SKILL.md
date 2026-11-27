---
name: weekly-content-pack
description: Generate Joseph's weekly Twitter/X content pack — 7 threads, 7 "just the thing" captions, 7 quick-value posts, plus a shot list for automated capture. Use when Joseph asks for the week's content, a content pack, or posts for a project. Takes a repo and/or live URL plus his story bits.
---

# Weekly content pack

Produce one week of Twitter/X content for Joseph from one real project.

Read `references/frameworks.md` (rotation, post skeleton, X rules),
`references/voice.md` (how he writes — load this before drafting a single line)
and `references/schema.md` (shot list format) before drafting.

## The one rule that matters

**Never invent a story, a result, a number, a client detail or a failure.**

Not a plausible-sounding user count. Not "it broke in production" if you don't know
it did. Not "a client asked for this" if no client exists. A hackathon project with
no users has no users — say what it actually is, or say nothing.

When a story bit is missing:

1. Check `projects/<name>/facts.md` — it may already be confirmed.
2. Dig the repo for evidence: `git log`, commits with "fix" in the subject, the
   diff of a commit whose message names a problem, the README's limitations
   section, test files, TODOs. A commit that says a quota ran out is evidence a
   quota ran out. The *reason behind* a decision is not in the diff.
3. Still missing? **Ask him**, in a short numbered list at the end of your reply.
   Draft everything that doesn't depend on the answer and mark the gap inline as
   `[NEEDS JOSEPH: why did you pivot from sellers to stylists?]`.

Never fill a gap with something that merely sounds right.

## Workflow

### 1. Intake

Need: project repo and/or live URL, a 3–4 line summary (who it's for, the problem,
status, anything confidential), demo login if required, and the story bits — how it
started, hardest part, what broke, any results, a real detail from his week.

If a brief wasn't given, ask using `assets/brief-template.md`. If
`projects/<name>/brief.md` exists, read it.

### 2. Research

Clone or read the repo. Build an evidence list before writing:

- `git log --pretty='%ad | %s' --date=short` — the shape of the work, real dates
- `git log --shortstat` — size of each push; a 10,000-line day is a real number
- Commits naming a problem → read the diff; that's a genuine "what broke"
- README "limits" / "known issues" sections → honest Friday material
- The architecture itself: what the server does vs what the model does, where the
  guardrails are. This is the best teaching material because it's specific.

Record every confirmed fact in `projects/<name>/facts.md` with its source
(commit hash, file path, or "Joseph confirmed <date>"). Append, never rewrite.

### 3. His take — always ask, never skip

**Never go from research straight to drafting.** The repo gives facts. It cannot
give the opinion that makes a post worth reading, and an opinion invented on his
behalf is the same offence as an invented number.

So after research, stop and ask what he actually thinks. Ask it *informed* —
questions built on what you just found in the repo, not a generic form. Bad:
"What do you think about the project?" Good: "You let the server compute every
price and kept the discount floor away from the model. Was that a trust thing, a
cost thing, or did the model get it wrong once?"

Ask 5-8 of these. Short enough to answer on a phone. Say up front that one-line
answers are fine and "no strong view" is a real answer.

Cover:

1. **The opinion.** What does he actually believe about this project, or about
   the way people build things like it? What would he argue with someone about?
   This becomes the hooks.
2. **The decision he'd defend.** One choice in the build he'd push back on if a
   reviewer questioned it, and why.
3. **What annoyed him.** The part that was tedious, stupid, or took far longer
   than it should have.
4. **What he'd tell a beginner** about this project in one sentence.
5. **What he'd do differently** with another week.
6. **Who he's hoping reads it** this week - founders, other devs, beginners? It
   changes the register.
7. **Anything he's tired of seeing** people say about this topic. Contrarian
   takes are his strongest register - see `references/voice.md`.
8. **The hardest part**, and **what broke**, if intake didn't already get them.

Then play it back in 3-4 lines: *"So the angle this week is X, you'd argue Y, and
the thing you're tired of is Z."* Let him correct it before drafting. A wrong
angle wastes the whole pack.

Append his answers to `projects/<name>/facts.md` under a dated **His take**
heading, marked as his words. Opinions stay quotable and reusable, and it stops
you asking the same thing next week.

### 4. Draft

21 posts: for each of Mon–Sun, one theme post (a 5–7 tweet thread by default,
following that day's slot in the rotation), one "just the thing" caption, one
quick-value post.

Spread the project across the week so the days don't repeat each other. Each
thread needs its own angle — if Tuesday and Wednesday would make the same point,
change one.

Write each thread as numbered, ready-to-paste tweets. Mark where the shot goes.

### 5. Shot list

Write `shotlist.json` per `references/schema.md`. Every post that references a
visual needs an entry. Be honest about `mode`:

- `screenshot` — a page state the script can reach by clicking and typing
- `recording` — a short flow, 8–15s, **landscape/desktop**. Portrait recordings
  of a web app read badly on X. Only use `mobile` for a recording when the post
  is specifically about how it behaves on a phone
- `manual` — needs his terminal, real money, a real DM inbox, or a third-party
  login that blocks automation. Give a one-line instruction, not an apology.

Mask anything that leaks: test emails, tokens, internal ids.

### 6. Deliver

Write `pack.md`, `shotlist.json`, run the capture, commit. Then tell him in a few
lines: what's in the pack, what the capture produced, what's in `MANUAL.md` for
him, and any `[NEEDS JOSEPH]` gaps as a numbered list.

## Quality bar

Before you hand it over, check each post:

- Does the hook stand alone, and is it specific? "I built an AI agent" fails.
  "The AI never sees the lowest price it's allowed to accept" passes.
- Would a founder reading it think "this person could build my thing"?
- Does it sound like him — short lines, plain words, direct — or like an AI wrote
  it? No "delve", no "game-changer", no "unlock", no three-item rule of three in
  every tweet, no em-dash-heavy rhythm he doesn't use.
- Is every factual claim traceable to `facts.md` or the repo?
- Links in a reply, not the main tweet. No hashtag spam.

If a post only works because of a number you can't source, cut the post.
