import React, { useState } from "react"
import type { VideoClip } from "@/lib/types"
import { cn } from "@/lib/utils"

interface VideoClipProps {
  clip: VideoClip
  className?: string
}

/**
 * Extracts the YouTube video ID from a YouTube URL.
 */
const extract_youtube_id = (url: string): string | null => {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

/**
 * Builds a YouTube embed URL with optional start/end times.
 */
const build_embed_url = (video_id: string, start?: number, end?: number): string => {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "0",
    rel: "0",
    modestbranding: "1",
  })
  if (start !== undefined) params.set("start", String(Math.floor(start)))
  if (end !== undefined) params.set("end", String(Math.floor(end)))
  return `https://www.youtube.com/embed/${video_id}?${params.toString()}`
}

/**
 * Builds a YouTube thumbnail URL.
 */
const build_thumbnail_url = (video_id: string): string => {
  return `https://img.youtube.com/vi/${video_id}/mqdefault.jpg`
}

const VideoClipPreview: React.FC<VideoClipProps> = ({ clip, className }) => {
  const [is_playing, set_is_playing] = useState(false)
  const video_id = extract_youtube_id(clip.url)

  if (!video_id) {
    return (
      <a
        href={clip.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-500 underline"
      >
        View clip
      </a>
    )
  }

  const embed_url = build_embed_url(video_id, clip.start, clip.end)
  const thumbnail_url = build_thumbnail_url(video_id)

  return (
    <div className={cn("relative overflow-hidden rounded-md", className)}>
      {is_playing ? (
        <iframe
          src={embed_url}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full"
          title="Mechanic video clip"
        />
      ) : (
        <button
          onClick={() => set_is_playing(true)}
          className="group relative block aspect-video w-full overflow-hidden rounded-md bg-black"
          aria-label="Play video clip"
        >
          <img
            src={thumbnail_url}
            alt="Video thumbnail"
            className="w-full object-cover opacity-80 transition group-hover:opacity-100"
          />
          {/* Play button overlay */}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600/90 shadow-lg transition group-hover:scale-110">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 translate-x-0.5 fill-white"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
          {/* Time range badge */}
          {clip.start !== undefined && (
            <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 py-0.5 text-[10px] text-white">
              {clip.start !== undefined
                ? `${Math.floor(clip.start / 60)}:${String(Math.floor(clip.start % 60)).padStart(2, "0")}`
                : ""}
              {clip.end !== undefined
                ? ` – ${Math.floor(clip.end / 60)}:${String(Math.floor(clip.end % 60)).padStart(2, "0")}`
                : ""}
            </span>
          )}
        </button>
      )}
    </div>
  )
}

export default VideoClipPreview
