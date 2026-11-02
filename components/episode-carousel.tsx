"use client"

import { ChevronLeft, ChevronRight, List } from "lucide-react"
import { useState } from "react"
import EpisodeCard from "@/components/episode-card"
import EpisodeListModal from "@/components/episode-list-modal"
import type { Episode } from "@/lib/episodes"

interface EpisodeCarouselProps {
  episodes: Episode[] // newest first
  index: number
  onSelect: (number: number) => void
}

const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5b810]"

function SideNav({ episode, direction, onClick }: { episode: Episode; direction: "newer" | "older"; onClick: () => void }) {
  const Icon = direction === "newer" ? ChevronLeft : ChevronRight
  return (
    <button
      onClick={onClick}
      className={`group absolute top-[180px] w-48 flex flex-col items-center gap-3 text-center rounded-xl p-2 ${direction === "newer" ? "right-full mr-4" : "left-full ml-4"} ${focusRing}`}
      aria-label={`${direction === "newer" ? "Newer" : "Older"} episode: ${episode.title} with ${episode.side_title}`}
    >
      <span className="p-3 rounded-full bg-[#f5b810] group-hover:bg-[#ffc933] group-active:scale-95 transition">
        <Icon className="w-7 h-7 text-black" aria-hidden />
      </span>
      <span className="space-y-1 opacity-60 group-hover:opacity-100 transition-opacity">
        <span className="block text-xs uppercase tracking-wide text-white/60">{direction === "newer" ? "Newer" : "Older"}</span>
        <span className="block text-sm font-semibold leading-tight">{episode.title}</span>
        <span className="block text-xs text-white/60">{episode.side_title}</span>
      </span>
    </button>
  )
}

export default function EpisodeCarousel({ episodes, index, onSelect }: EpisodeCarouselProps) {
  const [isListOpen, setIsListOpen] = useState(false)
  const [tab, setTab] = useState<"description" | "timestamps">("description")
  const episode = episodes[index]
  const newer = index > 0 ? episodes[index - 1] : undefined
  const older = index < episodes.length - 1 ? episodes[index + 1] : undefined

  return (
    <div className="min-h-screen flex flex-col w-full">
      <header className="w-full py-6 md:py-12">
        <div className="flex justify-center items-center gap-6 md:gap-12">
          <a href="/" onClick={(e) => { if (e.button === 0 && !e.metaKey && !e.ctrlKey) { e.preventDefault(); onSelect(episodes[0].number) } }} className={`rounded ${focusRing}`} aria-label="Anagoge Podcast, latest episode">
            <img
              src="/images/logo-256.webp"
              alt="Anagoge Podcast"
              width={256}
              height={249}
              fetchPriority="high"
              className="w-20 md:w-32 h-auto"
            />
          </a>
          <button
            onClick={() => setIsListOpen(true)}
            className={`flex items-center gap-2 p-2 md:px-4 md:py-3 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors text-sm font-medium ${focusRing}`}
            aria-haspopup="dialog"
            aria-expanded={isListOpen}
          >
            <List className="w-5 h-5 md:w-6 md:h-6" aria-hidden />
            <span className="sr-only md:not-sr-only">All episodes</span>
          </button>
        </div>
      </header>

      <div className="flex-1 w-full pb-12 px-4">
        <div className="relative w-full max-w-3xl mx-auto">
          {newer && (
            <div className="hidden lg:block">
              <SideNav episode={newer} direction="newer" onClick={() => onSelect(newer.number)} />
            </div>
          )}
          {older && (
            <div className="hidden lg:block">
              <SideNav episode={older} direction="older" onClick={() => onSelect(older.number)} />
            </div>
          )}
          <EpisodeCard key={episode.number} episode={episode} layoutEpisodes={episodes} newer={newer} older={older} onSelect={onSelect} tab={tab} onTabChange={setTab} />
        </div>
      </div>

      <EpisodeListModal
        episodes={episodes}
        isOpen={isListOpen}
        onClose={() => setIsListOpen(false)}
        onEpisodeSelect={onSelect}
        currentNumber={episode.number}
      />
    </div>
  )
}
