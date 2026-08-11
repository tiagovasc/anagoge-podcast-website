"use client"

import { X } from "lucide-react"

interface Episode {
  title: string
  side_title: string
}

interface EpisodeListModalProps {
  episodes: Episode[]
  isOpen: boolean
  onClose: () => void
  onEpisodeSelect: (index: number) => void
  currentIndex: number
}

export default function EpisodeListModal({
  episodes,
  isOpen,
  onClose,
  onEpisodeSelect,
  currentIndex,
}: EpisodeListModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-lg w-full max-w-2xl max-h-[90vh] md:max-h-[80vh] flex flex-col border border-black/10 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-black/10 dark:border-white/10">
          <h2 className="text-lg md:text-xl font-bold">Episodes</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Episode List */}
        <div className="overflow-y-auto flex-1">
          <div className="divide-y divide-black/10 dark:divide-white/10">
            {episodes.map((episode, index) => {
              const episodeNumber = episodes.length - index
              const isSelected = index === currentIndex

              return (
                <button
                  key={index}
                  onClick={() => {
                    onEpisodeSelect(index)
                    onClose()
                  }}
                  className={`w-full text-left p-3 md:p-4 transition-colors ${
                    isSelected
                      ? "bg-[#f5b810] text-black"
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <p className="text-xs font-semibold opacity-70 mb-1">EPISODE {episodeNumber}</p>
                  <p className={`font-semibold text-sm md:text-base leading-tight mb-1 ${isSelected ? "text-black" : ""}`}>
                    {episode.title}
                  </p>
                  <p className={`text-xs md:text-sm opacity-70 ${isSelected ? "text-black/80" : ""}`}>
                    {episode.side_title}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
