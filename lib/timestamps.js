// Pure helpers shared by the site and the tests (plain JS so `node --test` can import them).

/** "1:02:03" | "02:03" | "3" -> seconds */
export function toSeconds(time) {
  const parts = String(time).split(":").map(Number)
  if (parts.some(Number.isNaN)) return 0
  return parts.reduce((total, part) => total * 60 + part, 0)
}

/**
 * Parse a newline-separated chapter list such as "0:00:00 - Introduction".
 * Leading separators (" - ", " – ", ":") after the time are stripped so every
 * episode renders the same way regardless of how its description was typed.
 * @returns {{ time: string, name: string, seconds: number }[]}
 */
export function parseTimestamps(text) {
  if (!text) return []
  const out = []
  for (const line of String(text).split(/\r?\n/)) {
    const m = line.match(/^\s*(\d{1,2}(?::\d{1,2}){1,2})\s*(?:[-–—:|]\s*)?(.+?)\s*$/)
    if (!m) continue
    out.push({ time: m[1], name: m[2], seconds: toSeconds(m[1]) })
  }
  return out
}

/** Collapse whitespace and trim to roughly `max` characters on a word boundary. */
export function summarize(text, max = 160) {
  const flat = String(text || "").replace(/\s+/g, " ").trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:\s]+$/, "") + "…"
}
