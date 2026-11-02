"use client"

import { useCallback, useEffect, useState } from "react"
import EpisodeCarousel from "@/components/episode-carousel"
import type { Episode } from "@/lib/episodes"

interface HomeProps {
  episodes: Episode[] // newest first
  initialNumber: number
}

const LATEST_TITLE = "Anagoge Podcast"

function numberFromPath(path: string, fallback: number) {
  const m = path.match(/^\/episode\/(\d+)\/?$/)
  return m ? Number(m[1]) : fallback
}

export default function Home({ episodes, initialNumber }: HomeProps) {
  const latest = episodes[0].number
  const [number, setNumber] = useState(initialNumber)
  const index = Math.max(0, episodes.findIndex((e) => e.number === number))
  const episode = episodes[index]

  // Navigate without a page load; keep the URL shareable and the tab title accurate.
  const goTo = useCallback(
    (next: number, opts: { replace?: boolean; scroll?: boolean } = {}) => {
      if (!episodes.some((e) => e.number === next)) return
      setNumber(next)
      const url = `/episode/${next}`
      if (window.location.pathname !== url) {
        if (opts.replace) window.history.replaceState({ n: next }, "", url)
        else window.history.pushState({ n: next }, "", url)
      }
      if (opts.scroll !== false && window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: "instant" })
      }
    },
    [episodes],
  )

  // Back/forward buttons.
  useEffect(() => {
    const onPop = () => setNumber(numberFromPath(window.location.pathname, latest))
    window.addEventListener("popstate", onPop)
    return () => window.removeEventListener("popstate", onPop)
  }, [latest])

  useEffect(() => {
    document.title = number === latest && window.location.pathname === "/" ? LATEST_TITLE : `${episode.title} with ${episode.side_title} | Anagoge Podcast`
  }, [number, latest, episode])

  // Arrow keys move between episodes (left = newer, right = older), unless typing or a dialog is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return
      const t = e.target as HTMLElement | null
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
      if (document.body.classList.contains("modal-open")) return
      if (e.key === "ArrowLeft" && index > 0) goTo(episodes[index - 1].number)
      if (e.key === "ArrowRight" && index < episodes.length - 1) goTo(episodes[index + 1].number)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index, episodes, goTo])

  return (
    <main className="w-full min-h-screen bg-black text-white overflow-x-hidden [overflow-anchor:none]">
      <EpisodeCarousel episodes={episodes} index={index} onSelect={goTo} />
    </main>
  )
}
