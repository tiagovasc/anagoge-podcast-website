export default function YouTubeEmbed({ videoId }: { videoId: string }) {
  return (
    <div className="relative pb-[56.25%] w-full bg-[#f5b810]">
      <iframe
        className="absolute top-0 left-0 w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen={true}
      ></iframe>
    </div>
  )
}
