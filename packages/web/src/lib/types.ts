export type MechanicCategory =
  | "flip_reset"
  | "dribble_flick"
  | "pinch"
  | "powershot"
  | "dribble"
  | "air_dribble"
  | "redirect"
  | "pogo"
  | "dash"
  | "save"
  | "shot"
  | "movement"
  | "unknown"

export type MechanicType = "ground" | "air" | "wall" | "ceiling" | "mixed"

export interface VideoClip {
  url: string
  start?: number
  end?: number
}

export interface Mechanic {
  id: string
  name: string
  aliases?: string[]
  description: string
  category: MechanicCategory
  type?: MechanicType
  difficulty: number
  viability: number
  tags: string[]
  prerequisites?: string[]
  proponents?: string[]
  perform_instructions?: string
  video_clips?: VideoClip[]
}

export interface MechanicsData {
  version: number
  mechanics: Mechanic[]
}

export interface ActiveFilters {
  search: string
  category: MechanicCategory | "all"
  type: MechanicType | "all"
  difficulty_min: number
  difficulty_max: number
  viability_min: number
  viability_max: number
  tags: string[]
}
