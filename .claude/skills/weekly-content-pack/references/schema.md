# Shot list schema

One `shotlist.json` per week. The capture script reads it and writes PNGs, MP4s
and a `MANUAL.md`.

## Top level

| Key | Required | Notes |
|-----|----------|-------|
| `project` | yes | folder name, e.g. `acag` |
| `week` | yes | ISO week, e.g. `2026-W49` |
| `base_url` | yes | live site root |
| `cold_start_ms` | no | default 90000. Render/Fly free tiers sleep; the script warms the site before the first shot |
| `auth` | no | see below |
| `viewports` | no | overrides the defaults |
| `shots` | yes | array |

## auth

Credentials come from **environment variables**, never from this file.

```json
"auth": {
  "login_path": "/dashboard",
  "user_selector": "#email",
  "pass_selector": "#password",
  "submit_selector": "button[type=submit]",
  "user_env": "ACAG_USER",
  "pass_env": "ACAG_PASS",
  "success_text": "Diary"
}
```

Omit entirely if the demo is open. `success_text` is what the script waits for to
know the login worked.

## viewports

```json
"viewports": {
  "desktop": { "width": 1440, "height": 900, "scale": 2 },
  "mobile":  { "device": "iPhone 14 Pro" }
}
```

`device` uses a Playwright device descriptor and sets its own scale factor. Use
`scale: 2` for anything a human will look at, `1` when a pixel size is specified.

## A shot

| Key | Required | Notes |
|-----|----------|-------|
| `id` | yes | unique, `day-NN`, e.g. `mon-01`. Becomes the filename |
| `post` | yes | which post it belongs to, e.g. `mon-thread` |
| `tweet` | no | which tweet in the thread carries it |
| `mode` | yes | `screenshot` \| `recording` \| `manual` |
| `intent` | yes | one line, plain English — what should be visible. This is what Joseph reads |
| `viewports` | no | subset of the viewport names. Default both |
| `path` | for screenshot/recording | path appended to `base_url` |
| `steps` | no | actions to reach the state |
| `clip` | no | selector to crop to. Use it; full pages make weak tweets |
| `mask` | no | selectors blanked before capture — test emails, tokens, ids |
| `full_page` | no | default false |
| `duration_s` | recording | 8–15. Longer than 20 doesn't get watched |
| `manual_reason` | manual | why the script can't do it, in one line |
| `manual_steps` | manual | what Joseph should record, as a short list |

## Steps

```json
"steps": [
  { "action": "type",        "selector": "#msg", "text": "how much for knotless braids?" },
  { "action": "click",       "selector": "#send" },
  { "action": "press",       "key": "Enter" },
  { "action": "waitForText", "text": "$70" },
  { "action": "waitFor",     "selector": ".price-card" },
  { "action": "wait",        "ms": 1200 },
  { "action": "scroll",      "selector": ".chat", "to": "bottom" },
  { "action": "hover",       "selector": ".slot" },
  { "action": "upload",      "selector": "input[type=file]", "file": "demo-assets/style.jpg" }
]
```

Steps run in order. `waitForText` is better than `wait` — it waits for the thing
rather than guessing how long it takes.

## Output

```
projects/<project>/<week>/shots/mon-01-desktop.png
projects/<project>/<week>/shots/mon-01-mobile.png
projects/<project>/<week>/shots/tue-01-mobile.mp4
projects/<project>/<week>/MANUAL.md
```

## Honesty

Set `mode: "manual"` when the shot needs his terminal, real money, a real DM
inbox, or a third-party login that blocks automation (PayPal's own pages usually
do). A flagged shot is a correct result, not a failure.
