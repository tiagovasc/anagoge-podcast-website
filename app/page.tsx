import Home from "@/components/home"
import { getEpisodes } from "@/lib/episodes"

export default function Page() {
  const episodes = getEpisodes()
  return <Home episodes={episodes} initialNumber={episodes[0].number} />
}
