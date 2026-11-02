import fs from "node:fs"
import path from "node:path"

export interface Episode {
  number: number
  title: string
  side_title: string
  youtube_id: string
  description: string
  timestamps: string
  apple_link: string
  spotify_link: string
  youtube_link: string
  google_link?: string
  medium_link?: string
}

const DIR = path.join(process.cwd(), "public", "episodes")

/**
 * Every published episode, newest first, read once at build time.
 * Episode N comes from `public/episodes/epN.json`. Gaps in numbering no longer
 * truncate the site; the build log warns about them instead.
 */
export function getEpisodes(): Episode[] {
  const files = fs.readdirSync(DIR).filter((f) => /^ep\d+\.json$/.test(f))
  const episodes = files.map((file) => {
    const number = Number(file.match(/\d+/)![0])
    const data = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"))
    return { ...data, number } as Episode
  })
  episodes.sort((a, b) => b.number - a.number)
  const max = episodes[0]?.number ?? 0
  if (episodes.length !== max) console.warn(`[episodes] numbering has gaps: ${episodes.length} files, highest is ep${max}`)
  return episodes
}
