import Link from "next/link"

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <img src="/images/logo-256.webp" alt="Anagoge Podcast" width={128} height={124} className="w-24 h-auto" />
      <h1 className="text-2xl font-bold">This page doesn&apos;t exist</h1>
      <p className="text-white/60">The link may be mistyped, or the episode may have moved.</p>
      <Link href="/" className="px-5 py-2.5 rounded-lg bg-[#f5b810] text-black font-semibold hover:bg-[#ffc933] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        See all episodes
      </Link>
    </main>
  )
}
