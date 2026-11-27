#!/usr/bin/env node
/**
 * capture.js — read a shot list, produce X-ready screenshots and MP4s.
 *
 *   node scripts/capture.js projects/acag/2026-W49/shotlist.json
 *   node scripts/capture.js <shotlist> --only mon-01,tue-02
 *   node scripts/capture.js <shotlist> --mode screenshot
 *
 * Works on Windows cmd, macOS, Linux and cloud sessions. Needs Node 18+,
 * Playwright with Chromium, and ffmpeg on PATH.
 *
 * Shots it cannot honestly capture are written to MANUAL.md instead of faked.
 */

const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { chromium, devices } = require("playwright");

const DEFAULT_VIEWPORTS = {
  desktop: { width: 1440, height: 900, scale: 2 },
  mobile: { device: "iPhone 14 Pro" },
};

// ---------------------------------------------------------------- args

const argv = process.argv.slice(2);
if (!argv[0] || argv.includes("--help")) {
  console.log("usage: node scripts/capture.js <shotlist.json> [--only id,id] [--mode screenshot|recording]");
  process.exit(argv[0] ? 0 : 1);
}
const flag = (name) => {
  const i = argv.indexOf(name);
  return i === -1 ? null : argv[i + 1];
};
const shotlistPath = path.resolve(argv[0]);
const only = flag("--only") ? flag("--only").split(",").map((s) => s.trim()) : null;
const modeFilter = flag("--mode");

const list = JSON.parse(fs.readFileSync(shotlistPath, "utf8"));
const outDir = path.join(path.dirname(shotlistPath), "shots");
const manualPath = path.join(path.dirname(shotlistPath), "MANUAL.md");
const repoRoot = path.resolve(__dirname, "..");
fs.mkdirSync(outDir, { recursive: true });

const viewports = { ...DEFAULT_VIEWPORTS, ...(list.viewports || {}) };
const coldStart = list.cold_start_ms ?? 90_000;
const baseUrl = String(list.base_url || "").replace(/\/$/, "");

const results = { ok: [], failed: [], manual: [] };

// ---------------------------------------------------------------- helpers

const log = (...a) => console.log(...a);

function contextOptions(name) {
  const v = viewports[name];
  if (!v) throw new Error(`unknown viewport "${name}" — define it in shotlist.viewports`);
  if (v.device) {
    const d = devices[v.device];
    if (!d) throw new Error(`unknown Playwright device "${v.device}"`);
    return { ...d };
  }
  return {
    viewport: { width: v.width, height: v.height },
    deviceScaleFactor: v.scale ?? 2,
  };
}

/** Wake a sleeping free-tier host so the first real shot isn't a spinner. */
async function warmUp(browser) {
  if (!baseUrl) return;
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const started = Date.now();
  log(`warming ${baseUrl} (cold starts can take ~60s)...`);
  try {
    await page.goto(baseUrl, { timeout: coldStart, waitUntil: "domcontentloaded" });
    log(`  awake in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  } catch (e) {
    log(`  warm-up failed (${e.message.split("\n")[0]}) — continuing anyway`);
  }
  await ctx.close();
}

async function runSteps(page, steps = []) {
  for (const s of steps) {
    const sel = s.selector;
    switch (s.action) {
      case "goto":
        await page.goto(baseUrl + s.path, { waitUntil: "domcontentloaded" });
        break;
      case "click":
        await page.click(sel);
        break;
      case "type":
        await page.fill(sel, s.text);
        break;
      case "press":
        await page.keyboard.press(s.key);
        break;
      case "hover":
        await page.hover(sel);
        break;
      case "upload":
        await page.setInputFiles(sel, path.resolve(repoRoot, s.file));
        break;
      case "waitFor":
        await page.waitForSelector(sel, { state: s.state || "visible" });
        break;
      case "waitForText":
        await page.getByText(s.text, { exact: false }).first().waitFor({ state: "visible" });
        break;
      case "wait":
        await page.waitForTimeout(s.ms ?? 1000);
        break;
      case "scroll":
        await page.evaluate(
          ([q, to]) => {
            const el = q ? document.querySelector(q) : document.scrollingElement;
            if (!el) return;
            el.scrollTop = to === "top" ? 0 : el.scrollHeight;
          },
          [sel || null, s.to || "bottom"],
        );
        break;
      default:
        throw new Error(`unknown step action "${s.action}"`);
    }
  }
}

/** Blank out selectors that would leak test emails, tokens or ids. */
async function applyMasks(page, mask = []) {
  if (!mask.length) return;
  await page.evaluate((selectors) => {
    for (const q of selectors) {
      for (const el of document.querySelectorAll(q)) {
        el.style.filter = "blur(6px)";
        el.style.userSelect = "none";
      }
    }
  }, mask);
}

async function login(ctx) {
  const a = list.auth;
  if (!a) return;
  const user = process.env[a.user_env];
  const pass = process.env[a.pass_env];
  if (!user || !pass) {
    log(`  ! auth configured but ${a.user_env}/${a.pass_env} not set in the environment — skipping login`);
    return;
  }
  const page = await ctx.newPage();
  await page.goto(baseUrl + a.login_path, { timeout: coldStart, waitUntil: "domcontentloaded" });
  await page.fill(a.user_selector, user);
  await page.fill(a.pass_selector, pass);
  await page.click(a.submit_selector);
  if (a.success_text) {
    await page.getByText(a.success_text, { exact: false }).first().waitFor({ state: "visible" });
  }
  await page.close();
}

// ---------------------------------------------------------------- modes

async function screenshot(browser, shot, vpName) {
  const ctx = await browser.newContext(contextOptions(vpName));
  try {
    await login(ctx);
    const page = await ctx.newPage();
    page.setDefaultTimeout(30_000);
    await page.goto(baseUrl + (shot.path || "/"), { timeout: coldStart, waitUntil: "domcontentloaded" });
    await runSteps(page, shot.steps);
    await applyMasks(page, shot.mask);
    await page.waitForTimeout(400); // let layout and fonts settle

    const file = path.join(outDir, `${shot.id}-${vpName}.png`);
    let target = page;
    if (shot.clip) {
      const loc = page.locator(shot.clip).first();
      // Fail fast and clearly on a bad crop selector instead of hanging.
      if ((await page.locator(shot.clip).count()) === 0) {
        throw new Error(`clip selector matched nothing: ${shot.clip}`);
      }
      await loc.waitFor({ state: "visible", timeout: 10_000 });
      target = loc;
    }
    await target.screenshot({ path: file, fullPage: shot.clip ? undefined : !!shot.full_page });
    log(`  + ${path.basename(file)}`);
    results.ok.push(path.basename(file));
  } finally {
    await ctx.close();
  }
}

function ffmpeg(args) {
  return new Promise((resolve, reject) => {
    execFile("ffmpeg", args, { maxBuffer: 1 << 26 }, (err, _out, stderr) =>
      err ? reject(new Error(stderr?.slice(-600) || err.message)) : resolve(),
    );
  });
}

async function recording(browser, shot, vpName) {
  const raw = path.join(outDir, `.raw-${shot.id}-${vpName}`);
  fs.mkdirSync(raw, { recursive: true });
  const opts = contextOptions(vpName);
  // Playwright downscales video to fit ~800px by default, which looks soft on a
  // phone. Record at 2x the viewport (even numbers, H.264 needs them).
  const vw = opts.viewport?.width ?? 1280;
  const vh = opts.viewport?.height ?? 720;
  const even = (n) => Math.round(n / 2) * 2;
  const ctx = await browser.newContext({
    ...opts,
    recordVideo: { dir: raw, size: { width: even(vw * 2), height: even(vh * 2) } },
  });
  let videoPath;
  try {
    await login(ctx);
    const page = await ctx.newPage();
    page.setDefaultTimeout(30_000);
    await page.goto(baseUrl + (shot.path || "/"), { timeout: coldStart, waitUntil: "domcontentloaded" });
    await applyMasks(page, shot.mask);
    await runSteps(page, shot.steps);
    await page.waitForTimeout((shot.tail_ms ?? 1200)); // hold on the final frame
    videoPath = await page.video().path();
  } finally {
    await ctx.close(); // flush the video to disk
  }

  const mp4 = path.join(outDir, `${shot.id}-${vpName}.mp4`);
  // X wants H.264 + yuv420p, even dimensions, faststart. No audio track needed.
  await ffmpeg([
    "-y", "-i", videoPath,
    ...(shot.duration_s ? ["-t", String(shot.duration_s)] : []),
    "-vf", "scale='min(1280,iw)':-2:flags=lanczos,fps=30",
    "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-crf", "23", "-movflags", "+faststart", "-an",
    mp4,
  ]);
  fs.rmSync(raw, { recursive: true, force: true });
  const kb = (fs.statSync(mp4).size / 1024).toFixed(0);
  log(`  + ${path.basename(mp4)} (${kb} KB)`);
  results.ok.push(path.basename(mp4));
}

// ---------------------------------------------------------------- manual

function writeManual(manualShots, filtered) {
  // A filtered run (--only / --mode) sees only part of the week. Don't let it
  // overwrite a MANUAL.md that a full run wrote.
  if (filtered && !manualShots.length) {
    log("\n(filtered run — left MANUAL.md untouched)");
    return;
  }
  if (!manualShots.length) {
    fs.writeFileSync(manualPath, `# Manual shots — ${list.project} ${list.week}\n\nNone this week. Everything was captured automatically.\n`);
    return;
  }
  const body = manualShots
    .map((s) => {
      const steps = (s.manual_steps || []).map((t) => `   - ${t}`).join("\n");
      return [
        `## ${s.id} — ${s.post}${s.tweet ? ` (tweet ${s.tweet})` : ""}`,
        "",
        `**Shoot:** ${s.intent}`,
        `**Why you, not the script:** ${s.manual_reason || "needs a real action the script can't take"}`,
        s.duration_s ? `**Length:** about ${s.duration_s}s` : null,
        steps ? `\n**Steps:**\n${steps}` : null,
        "",
        `Save as: \`shots/${s.id}.png\` or \`shots/${s.id}.mp4\``,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n---\n\n");

  fs.writeFileSync(
    manualPath,
    `# Manual shots — ${list.project} ${list.week}\n\n` +
      `${manualShots.length} shot(s) need you. Everything else is in \`shots/\`.\n\n` +
      `For phone recordings: portrait, 1080p, under 20s. For terminal: increase the font size first.\n\n---\n\n${body}\n`,
  );
  log(`\nwrote ${path.relative(process.cwd(), manualPath)} (${manualShots.length} shot(s) for you)`);
}

// ---------------------------------------------------------------- main

(async () => {
  let shots = list.shots || [];
  if (only) shots = shots.filter((s) => only.includes(s.id));
  if (modeFilter) shots = shots.filter((s) => s.mode === modeFilter);

  const manualShots = shots.filter((s) => s.mode === "manual");
  const autoShots = shots.filter((s) => s.mode !== "manual");
  results.manual = manualShots.map((s) => s.id);

  log(`${list.project} ${list.week} — ${autoShots.length} to capture, ${manualShots.length} for you\n`);

  if (autoShots.length) {
    const browser = await chromium.launch({ args: ["--no-sandbox"] });
    try {
      await warmUp(browser);
      for (const shot of autoShots) {
        const vps = shot.viewports?.length ? shot.viewports : Object.keys(viewports);
        log(`${shot.id} [${shot.mode}] ${shot.intent}`);
        for (const vp of vps) {
          try {
            if (shot.mode === "recording") await recording(browser, shot, vp);
            else await screenshot(browser, shot, vp);
          } catch (e) {
            const msg = e.message.split("\n")[0];
            log(`  x ${shot.id}-${vp} FAILED: ${msg}`);
            results.failed.push(`${shot.id}-${vp}: ${msg}`);
          }
        }
      }
    } finally {
      await browser.close();
    }
  }

  writeManual(manualShots, Boolean(only || modeFilter));

  log(`\n--- done ---`);
  log(`captured: ${results.ok.length}`);
  log(`manual:   ${results.manual.length}${results.manual.length ? ` (${results.manual.join(", ")})` : ""}`);
  if (results.failed.length) {
    log(`failed:   ${results.failed.length}`);
    for (const f of results.failed) log(`  - ${f}`);
  }
  log(`output:   ${path.relative(process.cwd(), outDir)}`);
  process.exit(results.failed.length ? 1 : 0);
})().catch((e) => {
  console.error("\nfatal:", e.message);
  process.exit(1);
});
