"use client"

import { forwardRef, useImperativeHandle, useRef, useState } from "react"

export interface PlayerHandle {
  /** Start (or jump) playback at `seconds` and bring the player into view. */
  playFrom: (seconds: number) => void
}

interface Props {
  videoId: string
  title: string
}

/**
 * Lightweight YouTube player: shows the video thumbnail and only loads YouTube's
 * ~1-2 MB player when the visitor presses play (or picks a chapter).
 */
const YoutubeEmbed = forwardRef<PlayerHandle, Props>(function YoutubeEmbed({ videoId, title }, ref) {
  const [start, setStart] = useState<number | null>(null)
  const [thumb, setThumb] = useState<"sddefault" | "hqdefault">("sddefault")
  const [warmed, setWarmed] = useState(false)
  const wrapper = useRef<HTMLDivElement>(null)
  const iframe = useRef<HTMLIFrameElement>(null)

  const command = (func: string, args: unknown[] = []) =>
    iframe.current?.contentWindow?.postMessage(JSON.stringify({ event: "command", func, args }), "https://www.youtube-nocookie.com")

  useImperativeHandle(ref, () => ({
    playFrom(seconds: number) {
      if (start !== null && iframe.current) {
        command("seekTo", [seconds, true])
        command("playVideo")
      } else {
        setStart(seconds)
      }
      const rect = wrapper.current?.getBoundingClientRect()
      if (rect && (rect.top < 0 || rect.bottom > window.innerHeight)) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        wrapper.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" })
      }
    },
  }))

  return (
    <div ref={wrapper} className="relative w-full aspect-video bg-neutral-900">
      {warmed && start === null && (
        <>
          <link rel="preconnect" href="https://www.youtube-nocookie.com" />
          <link rel="preconnect" href="https://www.google.com" />
        </>
      )}
      {start === null ? (
        <button
          type="button"
          onClick={() => setStart(0)}
          onPointerEnter={() => setWarmed(true)}
          onFocus={() => setWarmed(true)}
          className="group absolute inset-0 w-full h-full focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#f5b810]"
          aria-label={`Play video: ${title}`}
        >
          <img
            src={`https://i.ytimg.com/vi/${videoId}/${thumb}.jpg`}
            alt=""
            width={640}
            height={480}
            fetchPriority="high"
            decoding="async"
            onLoad={(e) => {
              // YouTube answers a missing size with a 120x90 grey placeholder.
              if (thumb === "sddefault" && e.currentTarget.naturalWidth <= 120) setThumb("hqdefault")
            }}
            onError={() => thumb === "sddefault" && setThumb("hqdefault")}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <span className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-[68px] h-12 rounded-xl bg-black/75 group-hover:bg-[#ff0000] group-focus-visible:bg-[#ff0000] transition-colors shadow-lg">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white ml-0.5" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      ) : (
        <iframe
          ref={iframe}
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&enablejsapi=1&rel=0&playsinline=1${start ? `&start=${start}` : ""}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      )}
    </div>
  )
})

export default YoutubeEmbed
