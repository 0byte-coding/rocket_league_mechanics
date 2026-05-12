import React from "react"
import { get_rank_for_difficulty, type RankInfo } from "@/lib/ranks"
import { cn } from "@/lib/utils"

interface RankIconProps {
  difficulty: number
  size?: number
  show_label?: boolean
  className?: string
}

const Bronze: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <polygon points="20,4 36,34 4,34" fill={color} opacity="0.85" />
    <polygon points="20,10 30,30 10,30" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    <text x="20" y="27" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">I</text>
  </svg>
)

const Silver: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <polygon points="20,4 36,34 4,34" fill={color} opacity="0.85" />
    <polygon points="20,10 30,30 10,30" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    <text x="20" y="27" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="sans-serif">II</text>
  </svg>
)

const Gold: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect x="4" y="4" width="32" height="32" rx="4" fill={color} opacity="0.85" />
    <rect x="9" y="9" width="22" height="22" rx="2" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
    <text x="20" y="26" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="sans-serif">III</text>
  </svg>
)

const Platinum: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <polygon points="20,4 36,14 36,26 20,36 4,26 4,14" fill={color} opacity="0.85" />
    <polygon points="20,9 31,17 31,25 20,33 9,25 9,17" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
    <circle cx="20" cy="20" r="5" fill="rgba(255,255,255,0.5)" />
  </svg>
)

const Diamond: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <polygon points="20,4 36,20 20,36 4,20" fill={color} opacity="0.85" />
    <polygon points="20,10 30,20 20,30 10,20" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
    <circle cx="20" cy="20" r="4" fill="rgba(255,255,255,0.6)" />
  </svg>
)

const Champion: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <path d="M20 4 L36 20 L20 36 L4 20 Z" fill={color} opacity="0.85" />
    <path d="M20 10 L30 20 L20 30 L10 20 Z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
    <path d="M14 16 L20 10 L26 16 L22 20 L26 24 L20 30 L14 24 L18 20 Z" fill="rgba(255,255,255,0.25)" />
    <circle cx="20" cy="20" r="3.5" fill="rgba(255,255,255,0.7)" />
  </svg>
)

const GrandChampion: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <defs>
      <radialGradient id="gc_grad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#800000" stopOpacity="1" />
      </radialGradient>
    </defs>
    <circle cx="20" cy="20" r="16" fill="url(#gc_grad)" />
    <circle cx="20" cy="20" r="12" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
    <polygon points="20,10 22.5,17 30,17 24,21.5 26.5,29 20,24.5 13.5,29 16,21.5 10,17 17.5,17" fill="rgba(255,255,255,0.55)" />
  </svg>
)

const SSL: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <defs>
      <radialGradient id="ssl_grad" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
        <stop offset="50%" stopColor={color} stopOpacity="1" />
        <stop offset="100%" stopColor="#8800aa" stopOpacity="1" />
      </radialGradient>
    </defs>
    <circle cx="20" cy="20" r="16" fill="url(#ssl_grad)" />
    <circle cx="20" cy="20" r="12" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeDasharray="2 2" />
    <circle cx="20" cy="20" r="7" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
    <polygon points="20,9 22.5,16.5 30.5,16.5 24,21 26.5,28.5 20,24 13.5,28.5 16,21 9.5,16.5 17.5,16.5" fill="rgba(255,255,255,0.85)" />
  </svg>
)

const RANK_ICON_MAP: Record<string, React.FC<{ color: string; size: number }>> = {
  bronze: Bronze,
  silver: Silver,
  gold: Gold,
  platinum: Platinum,
  diamond: Diamond,
  champion: Champion,
  grand_champion: GrandChampion,
  ssl: SSL,
}

const RankIcon: React.FC<RankIconProps> = ({
  difficulty,
  size = 32,
  show_label = false,
  className,
}) => {
  const rank_info: RankInfo = get_rank_for_difficulty(difficulty)
  const IconComponent = RANK_ICON_MAP[rank_info.tier]

  if (!IconComponent) return null

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      title={`${rank_info.name} (difficulty ${difficulty}/100)`}
    >
      <IconComponent color={rank_info.color} size={size} />
      {show_label && (
        <span className="text-xs font-medium" style={{ color: rank_info.color }}>
          {rank_info.name}
        </span>
      )}
    </span>
  )
}

export default RankIcon
