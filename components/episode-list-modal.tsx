"use client"

import { Search, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import type { Episode } from "@/lib/episodes"

interface EpisodeListModalProps {
  episodes: Episode[]
  isOpen: boolean
  onClose: () => void
  onEpisodeSelect: (number: number) => void
  currentNumber: number
}

const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#f5b810]"

// Accent-insensitive matching so "jylkka" finds "Jylkkä" and "sjostedt" finds "Sjöstedt".
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()

export default function EpisodeListModal({ episodes, isOpen, onClose, onEpisodeSelect, currentNumber }: EpisodeListModalProps) {
  const [query, setQuery] = useState("")
  const dialog = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const current = useRef<HTMLButtonElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  const results = useMemo(() => {
    const terms = fold(query).split(/\s+/).filter(Boolean)
    if (!terms.length) return episodes
    return episodes.filter((e) => {
      const hay = fold(`${e.number} ${e.title} ${e.side_title} ${e.description} ${e.timestamps}`)
      return terms.every((t) => hay.includes(t))
    })
  }, [episodes, query])

  useEffect(() => {
    if (!isOpen) return
    const opener = document.activeElement as HTMLElement | null
    document.body.classList.add("modal-open")
    current.current?.scrollIntoView({ block: "center" })
    // Don't pop the on-screen keyboard on phones; focus the search box on desktop.
    if (window.matchMedia("(pointer: fine)").matches) input.current?.focus()
    else dialog.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        closeRef.current()
      }
      if (e.key === "Tab" && dialog.current) {
        const items = dialog.current.querySelectorAll<HTMLElement>("button, input, a[href]")
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.classList.remove("modal-open")
      setQuery("")
      opener?.focus?.()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="episode-list-title"
        tabIndex={-1}
        className="bg-neutral-900 rounded-xl w-full max-w-2xl max-h-[85dvh] md:max-h-[80vh] flex flex-col border border-white/10 shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between gap-4 px-4 pt-4 md:px-6 md:pt-6">
          <h2 id="episode-list-title" className="text-lg md:text-xl font-bold">
            Episodes <span className="text-white/40 font-normal">({episodes.length})</span>
          </h2>
          <button onClick={onClose} className={`p-2 -mr-2 hover:bg-white/10 rounded-lg transition-colors ${focusRing}`} aria-label="Close episode list">
            <X className="w-5 h-5 md:w-6 md:h-6" aria-hidden />
          </button>
        </div>

        <div className="px-4 pt-3 pb-4 md:px-6 border-b border-white/10">
          <label className="relative block">
            <span className="sr-only">Search episodes</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" aria-hidden />
            <input
              ref={input}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, guest or topic"
              autoComplete="off"
              enterKeyHint="search"
              className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-3 py-2.5 text-base md:text-sm placeholder:text-white/40 focus:outline-none focus:border-[#f5b810]"
              onKeyDown={(e) => {
                if (e.key === "Enter" && results[0]) {
                  e.preventDefault()
                  onEpisodeSelect(results[0].number)
                  onClose()
                }
              }}
            />
          </label>
        </div>

        <div className="overflow-y-auto overscroll-contain flex-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-sm text-white/60">
              <p>No episodes match &ldquo;{query}&rdquo;.</p>
              <button onClick={() => { setQuery(""); input.current?.focus() }} className={`mt-3 text-[#f5b810] hover:underline rounded ${focusRing}`}>
                Clear search
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {results.map((episode) => {
                const isCurrent = episode.number === currentNumber
                return (
                  <li key={episode.number}>
                    <button
                      ref={isCurrent ? current : undefined}
                      aria-current={isCurrent ? "true" : undefined}
                      onClick={() => {
                        onEpisodeSelect(episode.number)
                        onClose()
                      }}
                      className={`w-full text-left px-4 py-3 md:px-6 md:py-4 transition-colors ${focusRing} ${
                        isCurrent ? "bg-[#f5b810] text-black" : "hover:bg-white/5 active:bg-white/10"
                      }`}
                    >
                      <span className="block text-xs font-semibold opacity-70 mb-1">EPISODE {episode.number}</span>
                      <span className="block font-semibold text-sm md:text-base leading-tight mb-1">{episode.title}</span>
                      <span className="block text-xs md:text-sm opacity-70">{episode.side_title}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
