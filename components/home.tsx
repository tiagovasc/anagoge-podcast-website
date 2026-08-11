"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
// import ThemeToggle from "@/components/theme-toggle"
import Blur from "@/components/blur"
import EpisodeCarousel from "@/components/episode-carousel"

export default function Home() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function fetchEpisodes() {
      const episodes = []
      let episodeNumber = 1
      let consecutiveFailures = 0
      const maxConsecutiveFailures = 3

      while (consecutiveFailures < maxConsecutiveFailures) {
        try {
          const url = `/episodes/ep${episodeNumber}.json`
          const response = await fetch(url)

          if (response.ok) {
            const data = await response.json()
            episodes.push(data)
            consecutiveFailures = 0
          } else {
            consecutiveFailures++
          }
        } catch (error) {
          consecutiveFailures++
        }
        episodeNumber++
      }

      setPosts(episodes.reverse())
      setCurrentIndex(0)
      setLoading(false)
    }

    fetchEpisodes()
  }, [])

  if (loading) {
    return (
      <main className="w-screen h-screen flex flex-col items-center justify-center bg-white dark:bg-black">
        <Image
          src="/images/design-mode/anagogepodcastlogo.png"
          alt="Anagoge Logo"
          width={240}
          height={240}
          className="w-40 mb-8"
        />
        <div className="flex items-center gap-2">
          <span className="text-lg text-black/70 dark:text-white/70 font-light">Loading episodes</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-black/70 dark:bg-white/70 rounded-full animate-[pulse_1.2s_ease-in-out_0s_infinite]" />
            <span className="w-1.5 h-1.5 bg-black/70 dark:bg-white/70 rounded-full animate-[pulse_1.2s_ease-in-out_0.2s_infinite]" />
            <span className="w-1.5 h-1.5 bg-black/70 dark:bg-white/70 rounded-full animate-[pulse_1.2s_ease-in-out_0.4s_infinite]" />
          </div>
        </div>
        <div className="absolute bottom-10 right-10">
          {/* <ThemeToggle /> */}
        </div>
      </main>
    )
  }

  return (
    <main className="w-screen min-h-screen bg-white dark:bg-black text-black dark:text-white overflow-hidden">
      <EpisodeCarousel
        episodes={posts}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />
      <Blur />
      {/* <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div> */}
    </main>
  )
}
