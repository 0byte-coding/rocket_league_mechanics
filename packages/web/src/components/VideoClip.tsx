import React, { useState } from "react"
import type { VideoClip } from "@/lib/types"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

interface VideoClipProps {
  clip: VideoClip
  mechanic_name?: string
}

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

const format_time = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

const build_embed_url = (video_id: string, start?: number, end?: number): string => {
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
  })
  if (start !== undefined) params.set("start", String(Math.floor(start)))
  if (end !== undefined) params.set("end", String(Math.floor(end)))
  return `https://www.youtube.com/embed/${video_id}?${params.toString()}`
}

const VideoClipPreview: React.FC<VideoClipProps> = ({ clip, mechanic_name }) => {
  const [open, set_open] = useState(false)
  const video_id = extract_youtube_id(clip.url)

  if (!video_id) {
    return (
      <a href={clip.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">
        View clip
      </a>
    )
  }

  const thumbnail_url = `https://img.youtube.com/vi/${video_id}/mqdefault.jpg`
  const embed_url = build_embed_url(video_id, clip.start, clip.end)
  const time_label =
    clip.start !== undefined
      ? `${format_time(clip.start)}${clip.end !== undefined ? ` – ${format_time(clip.end)}` : ""}`
      : null

  return (
    <>
      {/* Thumbnail button */}
      <button
        onClick={(e) => { e.stopPropagation(); set_open(true) }}
        className="group relative block w-full overflow-hidden rounded-md bg-black"
        aria-label={`Play video clip${time_label ? ` (${time_label})` : ""}`}
      >
        <img
          src={thumbnail_url}
          alt="Video thumbnail"
          className="w-full object-cover opacity-75 transition-opacity group-hover:opacity-100"
        />
        {/* Play button */}
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600/90 shadow-lg transition-transform group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 translate-x-px fill-white" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </span>
        {/* Time badge */}
        {time_label && (
          <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 py-px text-[10px] leading-none text-white">
            {time_label}
          </span>
        )}
      </button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={set_open}>
        <DialogContent
          className="sm:max-w-3xl p-0 overflow-hidden gap-0"
          showCloseButton={false}
        >
          {/* Visually hidden title for a11y */}
          <DialogTitle className="sr-only">
            {mechanic_name ? `${mechanic_name} — video clip` : "Video clip"}
            {time_label ? ` (${time_label})` : ""}
          </DialogTitle>

          {/* 16:9 iframe */}
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              src={embed_url}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full border-0"
              title={mechanic_name ? `${mechanic_name} video clip` : "Video clip"}
            />
          </div>

          {/* Footer bar with time info + close */}
          <div className="flex items-center justify-between gap-2 bg-popover px-4 py-2">
            <span className="text-xs text-muted-foreground">
              {time_label ? `Clip: ${time_label}` : "Full video"}
            </span>
            <button
              onClick={() => set_open(false)}
              className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default VideoClipPreview
