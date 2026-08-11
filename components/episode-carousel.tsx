"use client"

import { ChevronLeft, ChevronRight, List } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import EpisodeCard from "@/components/episode-card"
import EpisodeListModal from "@/components/episode-list-modal"

interface EpisodeCarouselProps {
  episodes: any[]
  currentIndex: number
  setCurrentIndex: (index: number) => void
}

export default function EpisodeCarousel({
  episodes,
  currentIndex,
  setCurrentIndex,
}: EpisodeCarouselProps) {
  const [isListOpen, setIsListOpen] = useState(false)
  const prevIndex = currentIndex === 0 ? episodes.length - 1 : currentIndex - 1
  const nextIndex = currentIndex === episodes.length - 1 ? 0 : currentIndex + 1

  const handlePrev = () => setCurrentIndex(prevIndex)
  const handleNext = () => setCurrentIndex(nextIndex)

  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Header with Logo and Episode List Button */}
      <div className="w-full py-6 md:py-12">
        <div className="flex justify-center items-center gap-6 md:gap-12">
          <Image
            src="/images/design-mode/anagogepodcastlogo.png"
            alt="Anagoge Logo"
            width={120}
            height={120}
            className="w-20 md:w-32"
          />
          <button
            onClick={() => setIsListOpen(true)}
            className="p-2 md:p-3 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            title="View all episodes"
            aria-label="Open episode list"
          >
            <List className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full pb-12 px-4">

        {/* MOBILE: just the center card */}
        <div className="lg:hidden w-full max-w-3xl mx-auto">
          <EpisodeCard
            episode={episodes[currentIndex]}
            number={episodes.length - currentIndex}
            isPreview={false}
            isSelected={true}
            onNavigate={{ prev: handlePrev, next: handleNext }}
            previousEpisode={episodes[prevIndex]}
            nextEpisode={episodes[nextIndex]}
            currentIndex={currentIndex}
          />
        </div>

        {/* DESKTOP: center card with nav overlaid beside the YouTube widget */}
        <div className="hidden lg:block relative w-full max-w-3xl mx-auto">

          {/* Left nav — positioned to align with YouTube widget center */}
          {currentIndex !== 0 && (
            <div className="absolute right-full top-[180px] pr-6 flex flex-col items-center gap-3 w-48">
              <button
                onClick={handlePrev}
                className="p-3 rounded-full bg-[#f5b810] hover:bg-yellow-600 transition-colors flex-shrink-0"
                aria-label="Previous episode"
              >
                <ChevronLeft className="w-7 h-7 text-black" />
              </button>
              <div className="text-center opacity-60 space-y-1">
                <p className="text-xs uppercase tracking-wide text-white/50">Previous</p>
                <p className="text-sm font-semibold leading-tight">{episodes[prevIndex].title}</p>
                <p className="text-xs text-white/60">{episodes[prevIndex].side_title}</p>
              </div>
            </div>
          )}

          {/* Right nav — positioned to align with YouTube widget center */}
          <div className="absolute left-full top-[180px] pl-6 flex flex-col items-center gap-3 w-48">
            <button
              onClick={handleNext}
              className="p-3 rounded-full bg-[#f5b810] hover:bg-yellow-600 transition-colors flex-shrink-0"
              aria-label="Next episode"
            >
              <ChevronRight className="w-7 h-7 text-black" />
            </button>
            <div className="text-center opacity-60 space-y-1">
              <p className="text-xs uppercase tracking-wide text-white/50">Next</p>
              <p className="text-sm font-semibold leading-tight">{episodes[nextIndex].title}</p>
              <p className="text-xs text-white/60">{episodes[nextIndex].side_title}</p>
            </div>
          </div>

          {/* Center card */}
          <EpisodeCard
            episode={episodes[currentIndex]}
            number={episodes.length - currentIndex}
            isPreview={false}
            isSelected={true}
            onNavigate={{ prev: handlePrev, next: handleNext }}
            previousEpisode={episodes[prevIndex]}
            nextEpisode={episodes[nextIndex]}
            currentIndex={currentIndex}
          />
        </div>
      </div>

      {/* Episode List Modal */}
      <EpisodeListModal
        episodes={episodes}
        isOpen={isListOpen}
        onClose={() => setIsListOpen(false)}
        onEpisodeSelect={setCurrentIndex}
        currentIndex={currentIndex}
      />
    </div>
  )
}
