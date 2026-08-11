import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertYouTubeTimeToSeconds(timeString: string): number {
  const timeParts = timeString.split(":").map(Number)

  let hours = 0
  let minutes = 0
  let seconds = 0

  if (timeParts.length === 3) {
    ;[hours, minutes, seconds] = timeParts
  } else if (timeParts.length === 2) {
    ;[minutes, seconds] = timeParts
  } else if (timeParts.length === 1) {
    ;[seconds] = timeParts
  }

  const totalSeconds = hours * 3600 + minutes * 60 + seconds
  return totalSeconds
}

export function convertTimestampsToObjects(timestampString: string) {
  const regex = /(\d+:\d+:\d+|\d+:\d+|\d+:\d+)\s+(.+)/g
  const timestamps: any = []

  let match
  while ((match = regex.exec(timestampString)) !== null) {
    const time = match[1]
    const name = match[2]
    const seconds = convertYouTubeTimeToSeconds(time)

    timestamps.push({ time: time, name: name, seconds: seconds })
  }

  return timestamps
}
