import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Home from "@/components/home"
import { getEpisodes } from "@/lib/episodes"
import { summarize } from "@/lib/timestamps"

export const dynamicParams = false

export function generateStaticParams() {
  return getEpisodes().map((e) => ({ n: String(e.number) }))
}

export function generateMetadata({ params }: { params: { n: string } }): Metadata {
  const episode = getEpisodes().find((e) => String(e.number) === params.n)
  if (!episode) return {}
  const title = `${episode.title} with ${episode.side_title}`
  const description = summarize(episode.description)
  const image = `https://i.ytimg.com/vi/${episode.youtube_id}/hqdefault.jpg`
  return {
    title,
    description,
    alternates: { canonical: `/episode/${episode.number}` },
    openGraph: { title, description, type: "video.episode", url: `/episode/${episode.number}`, images: [{ url: image, width: 480, height: 360 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  }
}

export default function EpisodePage({ params }: { params: { n: string } }) {
  const episodes = getEpisodes()
  const episode = episodes.find((e) => String(e.number) === params.n)
  if (!episode) notFound()
  return <Home episodes={episodes} initialNumber={episode.number} />
}
