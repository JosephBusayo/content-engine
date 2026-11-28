# content-engine

Joseph's weekly Twitter/X content system. Runs anywhere Claude Code runs — phone,
laptop, or a cloud session. Nothing here depends on a specific machine.

## What it does

Each week you hand over one project (repo and/or live URL) plus the story bits only
you know. You get back 21 posts — 7 threads, 7 "just the thing" captions, 7
quick-value posts — each with a shot list, plus the screenshots and recordings
captured automatically from the live site.

## Use it

In Claude Code, from this repo:

    /weekly-content-pack

It will ask for the week's brief (or read `projects/<name>/brief.md` if you've
filled one in), check `projects/<name>/facts.md` so it never contradicts itself or
re-asks you things you've already confirmed, then write the pack and the shot list.

## Capture the shots

Linux / macOS / cloud session:

    node scripts/capture.js projects/acag/2026-W49/shotlist.json

Windows cmd:

    scripts\capture.cmd projects\acag\2026-W49\shotlist.json

Needs Node 18+, Playwright with Chromium, and ffmpeg on PATH. Anything the script
can't honestly capture — your terminal, real money, your actual DMs — is written to
`MANUAL.md` with a one-line instruction instead of being faked.

## Layout

    .claude/skills/weekly-content-pack/   the skill
    scripts/                              capture pipeline
    projects/<name>/facts.md              confirmed story bits, append-only
    projects/<name>/<week>/pack.md        the 21 posts + spares
    scripts/check-length.js               verify every tweet fits 280
    projects/<name>/<week>/shotlist.json  what to capture
    projects/<name>/<week>/shots/         captured png + mp4
    projects/<name>/<week>/MANUAL.md      shots you record yourself
