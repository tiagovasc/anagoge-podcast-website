"use client"

import { PiApplePodcastsLogo, PiSpotifyLogo, PiYoutubeLogo } from "react-icons/pi"
import { MdAutoStories } from "react-icons/md"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import YoutubeEmbed from "@/components/youtube-embed"
import { convertTimestampsToObjects } from "@/lib/utils"

interface Timestamp {
  time: string
  name: string
  seconds: number
}

interface EpisodeCardProps {
  episode: {
    title: string
    side_title: string
    youtube_id: string
    description: string
    timestamps: string
    apple_link: string
    spotify_link: string
    youtube_link: string
    google_link: string
    medium_link?: string
  }
  number: number
  isPreview: boolean
  isSelected: boolean
  onNavigate?: { prev: () => void; next: () => void }
  previousEpisode?: any
  nextEpisode?: any
  currentIndex?: number
}

export default function EpisodeCard({
  episode,
  number,
  isPreview,
  isSelected,
  onNavigate,
  previousEpisode,
  nextEpisode,
  currentIndex,
}: EpisodeCardProps) {
  const [showDetails, setShowDetails] = useState(isSelected && !isPreview)
  const [activeTab, setActiveTab] = useState<"description" | "timestamps">("description")

  if (isPreview) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 border border-black/10 dark:border-white/10">
        <div className="space-y-4">
          <div>
            <p className="text-xs text-black/50 dark:text-white/50 uppercase tracking-wide mb-2">
              Episode {number}
            </p>
            <h3 className="text-sm font-bold line-clamp-2">{episode.title}</h3>
            <p className="text-xs text-black/60 dark:text-white/60 mt-1">{episode.side_title}</p>
          </div>
          <p className="text-xs text-black/40 dark:text-white/40 line-clamp-3">
            {episode.description}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      {/* Episode Title */}
      <div className="space-y-3 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
          {episode.title}
        </h2>
        <p className="text-base md:text-lg text-black/70 dark:text-white/70 font-medium">
          {episode.side_title}
        </p>
      </div>

      {/* YouTube Embed */}
      {showDetails && (
        <div className="w-full flex justify-center">
          <div className="w-full lg:w-[55%]">
            <div className="rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
              <YoutubeEmbed videoId={episode.youtube_id} />
            </div>
          </div>
        </div>
      )}

      {/* Social Links */}
      {showDetails && (
        <div className="flex justify-center gap-4">
          <a
            href={episode.apple_link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title="Apple Podcasts"
          >
            <PiApplePodcastsLogo className="w-6 h-6" />
          </a>
          <a
            href={episode.spotify_link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title="Spotify"
          >
            <PiSpotifyLogo className="w-6 h-6" />
          </a>
          <a
            href={episode.youtube_link}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title="YouTube"
          >
            <PiYoutubeLogo className="w-6 h-6" />
          </a>
          {episode.medium_link && (
            <a
              href={episode.medium_link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              title="Read on Medium"
            >
              <MdAutoStories className="w-6 h-6" />
            </a>
          )}
        </div>
      )}

      {/* Mobile Navigation Section - Only visible on mobile, hide previous on latest episode */}
      {showDetails && onNavigate && previousEpisode && nextEpisode && (
        <div className="md:hidden space-y-3 py-4 border-t border-b border-black/10 dark:border-white/10">
          {/* Previous Episode - hidden on latest episode (currentIndex === 0) */}
          {currentIndex !== 0 && (
            <button
              onClick={onNavigate.prev}
              className="w-full text-left"
            >
              <div className="flex items-start gap-3 p-4 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <ChevronLeft className="w-5 h-5 text-[#f5b810] flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-black/50 dark:text-white/50 uppercase tracking-wide">Previous</p>
                  <p className="text-sm font-semibold leading-tight">{previousEpisode.title}</p>
                  <p className="text-xs text-black/60 dark:text-white/60 mt-1">{previousEpisode.side_title}</p>
                </div>
              </div>
            </button>
          )}

          {/* Next Episode */}
          <button
            onClick={onNavigate.next}
            className="w-full text-left"
          >
            <div className="flex items-start gap-3 p-4 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-black/50 dark:text-white/50 uppercase tracking-wide">Next</p>
                <p className="text-sm font-semibold leading-tight">{nextEpisode.title}</p>
                <p className="text-xs text-black/60 dark:text-white/60 mt-1">{nextEpisode.side_title}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#f5b810] flex-shrink-0 mt-0.5" />
            </div>
          </button>
        </div>
      )}

      {/* Description/Timestamps Tabs */}
      {showDetails && (
        <div className="space-y-4">
          {/* Tab buttons */}
          <div className="flex gap-2 border-b border-black/10 dark:border-white/10">
            <button
              onClick={() => setActiveTab("description")}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === "description"
                  ? "text-black dark:text-white border-b-2 border-[#f5b810]"
                  : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("timestamps")}
              className={`px-4 py-2 font-medium text-sm transition-colors ${
                activeTab === "timestamps"
                  ? "text-black dark:text-white border-b-2 border-[#f5b810]"
                  : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
              }`}
            >
              Timestamps
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "description" ? (
            <div className="space-y-4 pb-12">
              <p className="text-sm md:text-base whitespace-pre-line leading-relaxed text-black/80 dark:text-white/80">
                {episode.description}
              </p>
            </div>
          ) : (
            <div className="space-y-2 pb-12">
              {convertTimestampsToObjects(episode.timestamps).map(
                (timestamp: Timestamp, i: number) => (
                  <a
                    key={i}
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`https://www.youtube.com/watch?v=${episode.youtube_id}&t=${timestamp.seconds}s`}
                    className="block text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors py-2 border-b border-black/5 dark:border-white/5 last:border-b-0"
                  >
                    <span className="opacity-50 mr-2">{timestamp.time}</span> {timestamp.name}
                  </a>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
