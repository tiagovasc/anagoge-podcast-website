"use client"

import { PiApplePodcastsLogo, PiSpotifyLogo, PiYoutubeLogo } from "react-icons/pi"
import { MdAutoStories } from "react-icons/md"
import { Check, ChevronLeft, ChevronRight, Link2 } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import YoutubeEmbed, { type PlayerHandle } from "@/components/youtube-embed"
import { parseTimestamps } from "@/lib/timestamps"
import type { Episode } from "@/lib/episodes"

type Tab = "description" | "timestamps"

interface EpisodeCardProps {
  episode: Episode
  newer?: Episode
  older?: Episode
  onSelect: (number: number) => void
  tab: Tab
  onTabChange: (tab: Tab) => void
}

const focusRing = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5b810]"
const iconButton = `inline-flex items-center justify-center w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors ${focusRing}`

function ShareButton({ episode }: { episode: Episode }) {
  const [copied, setCopied] = useState(false)
  async function share() {
    const url = `${window.location.origin}/episode/${episode.number}`
    const title = `${episode.title} with ${episode.side_title}`
    try {
      if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* user cancelled the share sheet, or clipboard blocked: nothing to do */
    }
  }
  return (
    <button onClick={share} className={iconButton} aria-label={copied ? "Link copied" : "Share episode link"} title={copied ? "Link copied" : "Share episode link"}>
      {copied ? <Check className="w-5 h-5 text-[#f5b810]" aria-hidden /> : <Link2 className="w-5 h-5" aria-hidden />}
      <span className="sr-only" aria-live="polite">{copied ? "Link copied" : ""}</span>
    </button>
  )
}

function MobileNav({ episode, direction, onClick }: { episode: Episode; direction: "newer" | "older"; onClick: () => void }) {
  const label = direction === "newer" ? "Newer" : "Older"
  return (
    <button onClick={onClick} className={`w-full text-left rounded-lg ${focusRing}`}>
      <span className="flex items-center gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors">
        {direction === "newer" && <ChevronLeft className="w-5 h-5 text-[#f5b810] flex-shrink-0" aria-hidden />}
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-white/50 uppercase tracking-wide">{label}</span>
          <span className="block text-sm font-semibold leading-tight mt-0.5">{episode.title}</span>
          <span className="block text-xs text-white/60 mt-1">{episode.side_title}</span>
        </span>
        {direction === "older" && <ChevronRight className="w-5 h-5 text-[#f5b810] flex-shrink-0" aria-hidden />}
      </span>
    </button>
  )
}

export default function EpisodeCard({ episode, newer, older, onSelect, tab, onTabChange }: EpisodeCardProps) {
  const player = useRef<PlayerHandle>(null)
  const chapters = useMemo(() => parseTimestamps(episode.timestamps), [episode.timestamps])
  const showTabs = chapters.length > 0
  const activeTab: Tab = showTabs ? tab : "description"

  const links = [
    episode.apple_link && { href: episode.apple_link, label: "Listen on Apple Podcasts", Icon: PiApplePodcastsLogo },
    episode.spotify_link && { href: episode.spotify_link, label: "Listen on Spotify", Icon: PiSpotifyLogo },
    episode.youtube_link && { href: episode.youtube_link, label: "Watch on YouTube", Icon: PiYoutubeLogo },
    episode.medium_link && { href: episode.medium_link, label: "Read the article", Icon: MdAutoStories },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof PiYoutubeLogo }[]

  return (
    <article className="w-full space-y-6" aria-labelledby={`ep-${episode.number}-title`}>
      <div className="space-y-3 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#f5b810]">Episode {episode.number}</p>
        <h1 id={`ep-${episode.number}-title`} className="text-3xl md:text-4xl font-extrabold leading-tight text-balance">
          {episode.title}
        </h1>
        <p className="text-base md:text-lg text-white/70 font-medium">{episode.side_title}</p>
      </div>

      <div className="w-full flex justify-center">
        <div className="w-full lg:w-[55%] rounded-lg overflow-hidden border border-white/10">
          <YoutubeEmbed ref={player} videoId={episode.youtube_id} title={`${episode.title} with ${episode.side_title}`} />
        </div>
      </div>

      <div className="flex justify-center gap-3 md:gap-4">
        {links.map(({ href, label, Icon }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={iconButton} aria-label={label} title={label}>
            <Icon className="w-6 h-6" aria-hidden />
          </a>
        ))}
        <ShareButton episode={episode} />
      </div>

      {(newer || older) && (
        <nav className="lg:hidden space-y-3 py-4 border-y border-white/10" aria-label="More episodes">
          {newer && <MobileNav episode={newer} direction="newer" onClick={() => onSelect(newer.number)} />}
          {older && <MobileNav episode={older} direction="older" onClick={() => onSelect(older.number)} />}
        </nav>
      )}

      <div className="space-y-4">
        {showTabs && (
          <div role="tablist" aria-label="Episode details" className="flex gap-2 border-b border-white/10">
            {(["description", "timestamps"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                id={`tab-${t}`}
                aria-selected={activeTab === t}
                aria-controls={`panel-${t}`}
                onClick={() => onTabChange(t)}
                className={`-mb-px px-4 py-2.5 font-medium text-sm transition-colors border-b-2 rounded-t ${focusRing} ${
                  activeTab === t ? "text-white border-[#f5b810]" : "text-white/50 border-transparent hover:text-white"
                }`}
              >
                {t === "description" ? "Description" : `Chapters (${chapters.length})`}
              </button>
            ))}
          </div>
        )}

        {activeTab === "description" ? (
          <div role={showTabs ? "tabpanel" : undefined} id="panel-description" aria-labelledby={showTabs ? "tab-description" : undefined} className="pb-12">
            <p className="text-sm md:text-base whitespace-pre-line leading-relaxed text-white/80 break-words">{episode.description}</p>
          </div>
        ) : (
          <ol role="tabpanel" id="panel-timestamps" aria-labelledby="tab-timestamps" className="pb-12">
            {chapters.map((c, i) => (
              <li key={i} className="border-b border-white/5 last:border-b-0">
                <a
                  href={`https://www.youtube.com/watch?v=${episode.youtube_id}&t=${c.seconds}s`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
                    e.preventDefault()
                    player.current?.playFrom(c.seconds)
                  }}
                  className={`group flex gap-4 py-2.5 text-sm text-white/70 hover:text-white transition-colors rounded ${focusRing}`}
                >
                  <span className="w-16 flex-shrink-0 tabular-nums text-white/40 group-hover:text-[#f5b810] transition-colors">{c.time}</span>
                  <span>{c.name}</span>
                </a>
              </li>
            ))}
          </ol>
        )}
      </div>
    </article>
  )
}
