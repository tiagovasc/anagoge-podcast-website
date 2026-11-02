// Run with: npm test
import { test } from "node:test"
import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"
import { parseTimestamps, toSeconds, summarize } from "../lib/timestamps.js"

const DIR = path.join(process.cwd(), "public", "episodes")
const files = fs.readdirSync(DIR).filter((f) => /^ep\d+\.json$/.test(f))
const episodes = files.map((f) => ({ n: Number(f.match(/\d+/)[0]), ...JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) }))

test("toSeconds handles h:mm:ss, mm:ss and ss", () => {
  assert.equal(toSeconds("1:02:03"), 3723)
  assert.equal(toSeconds("02:03"), 123)
  assert.equal(toSeconds("7"), 7)
})

test("parseTimestamps strips the separator after the time", () => {
  const out = parseTimestamps("0:00:00 - Introduction\n12:34 – Middle\n1:02:03 End: part two\nnot a chapter")
  assert.deepEqual(out.map((c) => c.name), ["Introduction", "Middle", "End: part two"])
  assert.deepEqual(out.map((c) => c.seconds), [0, 754, 3723])
})

test("summarize trims on a word boundary", () => {
  assert.equal(summarize("short"), "short")
  const s = summarize("word ".repeat(100), 30)
  assert.ok(s.length <= 31 && s.endsWith("…"))
})

test("episode numbers are contiguous from 1", () => {
  const nums = episodes.map((e) => e.n).sort((a, b) => a - b)
  assert.deepEqual(nums, nums.map((_, i) => i + 1))
})

test("every episode has the required fields and a consistent YouTube id", () => {
  const ids = new Set()
  for (const e of episodes) {
    for (const k of ["title", "side_title", "youtube_id", "description", "timestamps", "apple_link", "spotify_link", "youtube_link"]) {
      assert.ok(typeof e[k] === "string" && e[k].trim(), `ep${e.n}: missing ${k}`)
    }
    assert.match(e.youtube_id, /^[\w-]{11}$/, `ep${e.n}: bad youtube_id`)
    assert.ok(e.youtube_link.includes(e.youtube_id), `ep${e.n}: youtube_link does not match youtube_id`)
    assert.ok(!ids.has(e.youtube_id), `ep${e.n}: duplicate youtube_id`)
    ids.add(e.youtube_id)
    assert.ok(parseTimestamps(e.timestamps).length > 0, `ep${e.n}: no parsable chapters`)
  }
})
