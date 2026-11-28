#!/usr/bin/env node
/**
 * check-length.js — verify every tweet in a pack fits X's free limit.
 *
 *   node scripts/check-length.js projects/acag/2026-W49/pack.md
 *
 * Reads every ```text fenced block and counts characters the way X does:
 * any URL counts as 23 regardless of real length. Exits non-zero if any
 * tweet is over, so it can gate a pack before delivery.
 */
const fs = require("fs");

const LIMIT = 280;
const URL_WEIGHT = 23;
const file = process.argv[2];
if (!file) {
  console.error("usage: node scripts/check-length.js <pack.md>");
  process.exit(1);
}

const src = fs.readFileSync(file, "utf8");
const blocks = [...src.matchAll(/```text\n([\s\S]*?)\n```/g)].map((m) => m[1]);

if (!blocks.length) {
  console.error("No ```text blocks found. Each tweet must sit in its own fenced block.");
  process.exit(1);
}

// X counts every link as 23 characters, long or short.
const weigh = (t) => t.replace(/https?:\/\/\S+/g, "x".repeat(URL_WEIGHT)).length;

let over = 0;
blocks.forEach((b, i) => {
  const n = weigh(b);
  const first = b.split("\n")[0].slice(0, 52);
  if (n > LIMIT) {
    over++;
    console.log(`${String(i + 1).padStart(2)}. ${n} OVER by ${n - LIMIT}  "${first}..."`);
  } else {
    console.log(`${String(i + 1).padStart(2)}. ${String(n).padStart(3)}  "${first}..."`);
  }
});

console.log(`\n${blocks.length} tweets, ${over} over the ${LIMIT} limit.`);
process.exit(over ? 1 : 0);
